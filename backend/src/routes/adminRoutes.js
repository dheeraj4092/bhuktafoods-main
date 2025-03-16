import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import multer from 'multer';
import path from 'path';
import {
    bulkUpdateStock,
    bulkDeleteProducts,
    bulkUpdateStatus,
    bulkUpdateFeatured
} from '../controllers/bulkOperationsController.js';
import {
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

const router = express.Router();
const upload = multer();

// Validation middleware
const validateBulkOperation = (req, res, next) => {
  const { productIds } = req.body;
  
  if (!Array.isArray(productIds)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'productIds must be an array',
      code: 'INVALID_PRODUCT_IDS'
    });
  }

  if (productIds.length === 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'productIds array cannot be empty',
      code: 'EMPTY_PRODUCT_IDS'
    });
  }

  next();
};

const validateStockUpdate = (req, res, next) => {
  const { operation, amount } = req.body;
  const validOperations = ['increment', 'decrement', 'set'];
  
  if (!validOperations.includes(operation)) {
    return res.status(400).json({
      error: 'Validation error',
      message: `operation must be one of: ${validOperations.join(', ')}`,
      code: 'INVALID_OPERATION'
    });
  }

  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'amount must be a non-negative number',
      code: 'INVALID_AMOUNT'
    });
  }

  next();
};

// Apply authentication and admin middleware to all routes
router.use(authenticateToken, isAdmin);

// Get dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        // Get total users
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get total products
        const { count: totalProducts } = await supabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Get total orders
        const { count: totalOrders } = await supabaseAdmin
            .from('orders')
            .select('*', { count: 'exact', head: true });

        res.json({
            totalUsers,
            totalProducts,
            totalOrders
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { data: users, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Input validation
        if (!email || !password || !full_name) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Email, password, and full name are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate role
        if (role && !['admin', 'customer'].includes(role)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Invalid role. Must be either "admin" or "customer"',
                code: 'INVALID_ROLE'
            });
        }

        // First check if user already exists in both auth and profiles
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', email)
            .single();

        if (existingProfile) {
            return res.status(400).json({
                error: 'User exists',
                message: 'User with this email already exists',
                code: 'DUPLICATE_USER'
            });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: role || 'customer'
            }
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            return res.status(400).json({
                error: 'Auth error',
                message: authError.message,
                code: 'AUTH_CREATE_ERROR'
            });
        }

        // Check if profile already exists for this user ID
        const { data: existingProfileById } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single();

        if (existingProfileById) {
            // If profile exists, update it instead of creating new
            const { data: updatedProfile, error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    email,
                    full_name,
                    role: role || 'customer',
                    updated_at: new Date().toISOString()
                })
                .eq('id', authData.user.id)
                .select()
                .single();

            if (updateError) {
                console.error('Profile update error:', updateError);
                return res.status(500).json({
                    error: 'Profile update failed',
                    message: updateError.message,
                    code: 'PROFILE_UPDATE_ERROR'
                });
            }

            return res.status(200).json(updatedProfile);
        }

        // Create new profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    full_name,
                    role: role || 'customer',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (profileError) {
            // If profile creation fails, delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Profile creation error:', profileError);
            return res.status(500).json({
                error: 'Profile creation failed',
                message: profileError.message,
                code: 'PROFILE_CREATE_ERROR'
            });
        }

        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create user',
            code: 'SERVER_ERROR'
        });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role } = req.body;

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name,
                role,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(profile);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete user from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (authError) throw authError;

        // Delete user profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id);

        if (profileError) throw profileError;

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ 
                error: 'Database error',
                message: 'Failed to fetch products',
                code: 'DB_ERROR'
            });
        }

        // Ensure we always return an array
        res.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'Failed to fetch products',
            code: 'SERVER_ERROR'
        });
    }
});

// Serve admin interface
router.get('/products/manage', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/products.html'));
});

// Get all orders with validation
router.get('/orders', async (req, res, next) => {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    email
                ),
                order_items (
                    id,
                    quantity,
                    price_at_time,
                    products (
                        id,
                        name,
                        image_url
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

// Get single order details
router.get('/orders/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data: order, error } = await supabaseAdmin
            .rpc('get_order_details', { p_order_id: id });

        if (error) throw error;
        if (!order) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
});

// Update order status with validation
router.put('/orders/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'status is required',
                code: 'MISSING_STATUS'
            });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Validation error',
                message: `status must be one of: ${validStatuses.join(', ')}`,
                code: 'INVALID_STATUS'
            });
        }

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!order) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Order not found',
                code: 'ORDER_NOT_FOUND'
            });
        }

        // Get updated order details
        const { data: orderDetails, error: detailsError } = await supabaseAdmin
            .rpc('get_order_details', { p_order_id: id });

        if (detailsError) throw detailsError;
        res.json(orderDetails);
    } catch (error) {
        next(error);
    }
});

// Bulk operations with validation
router.post('/products/bulk-stock-update', validateStockUpdate, bulkUpdateStock);
router.post('/products/bulk-delete', validateBulkOperation, bulkDeleteProducts);
router.post('/products/bulk-status-update', validateBulkOperation, bulkUpdateStatus);
router.post('/products/bulk-featured-update', validateBulkOperation, bulkUpdateFeatured);

// Product management routes
router.get('/products/:id', getProduct);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', authenticateToken, isAdmin, deleteProduct);

export default router; 