import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

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

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { email, password, full_name, role } = req.body;

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) throw authError;

        // Create user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    email,
                    full_name,
                    role: role || 'customer'
                }
            ])
            .select()
            .single();

        if (profileError) throw profileError;

        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
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

        if (error) throw error;
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create a new product
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, isAvailable, isPreOrder } = req.body;
        const imageFile = req.file;

        // Upload image to Supabase Storage
        let imageUrl = null;
        if (imageFile) {
            const fileExt = imageFile.originalname.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('products')
                .upload(filePath, imageFile.buffer, {
                    contentType: imageFile.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return res.status(500).json({ error: 'Failed to upload image' });
            }

            // Get the public URL for the uploaded image
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('products')
                .getPublicUrl(filePath);

            imageUrl = publicUrl;
        }

        // Create product in database
        const { data, error } = await supabaseAdmin
            .from('products')
            .insert([
                {
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    image_url: imageUrl,
                    is_available: isAvailable === 'true',
                    is_pre_order: isPreOrder === 'true'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return res.status(500).json({ error: 'Failed to create product' });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error in product creation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock_quantity, image_url } = req.body;

        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update({
                name,
                description,
                price,
                stock_quantity,
                image_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                profiles:user_id (
                    full_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

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
        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

export default router; 