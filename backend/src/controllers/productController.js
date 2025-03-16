import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import { supabaseAdmin } from '../config/supabase.js';

// Configure multer for memory storage (for Supabase upload)
const storage = multer.memoryStorage();

// Configure multer middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

// Export the configured multer middleware
export const uploadMiddleware = upload;

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get products error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch products'
      });
    }

    res.json(products || []);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch products'
    });
  }
};

// Check if product exists
export const checkProductExists = async (id) => {
  try {
    console.log('Checking if product exists:', id);
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Check product exists error:', error);
      return false;
    }

    console.log('Product exists:', data);
    return true;
  } catch (error) {
    console.error('Check product exists error:', error);
    return false;
  }
};

// Get product by ID
export const getProduct = async (req, res) => {
  try {
    console.log('getProduct called with params:', req.params);
    console.log('getProduct headers:', req.headers);
    
    const { id } = req.params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      console.log('Invalid UUID format:', id);
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }

    // Check if product exists
    const exists = await checkProductExists(id);
    if (!exists) {
      console.log('Product does not exist:', id);
      return res.status(404).json({ 
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    console.log('Fetching product with ID:', id);
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get product error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Product not found',
          message: 'The requested product does not exist'
        });
      }
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch product'
      });
    }

    console.log('Product found:', product);
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch product'
    });
  }
};

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      is_available,
      is_pre_order
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide all required product information'
      });
    }

    let image_url = null;

    // Handle image upload if file is present
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `product-${uuidv4()}${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabaseAdmin.storage
        .from('product-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Upload failed',
          message: 'Failed to upload product image'
        });
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    } else {
      return res.status(400).json({
        error: 'Missing image',
        message: 'Please provide a product image'
      });
    }

    // Set default values for optional fields
    const defaultStock = parseInt(stock_quantity) || 0;
    const defaultAvailability = is_available === undefined ? true : (is_available === 'true' || is_available === true);
    const defaultPreOrder = is_pre_order === undefined ? false : (is_pre_order === 'true' || is_pre_order === true);

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          category,
          image_url,
          stock_quantity: defaultStock,
          is_available: defaultAvailability,
          is_pre_order: defaultPreOrder
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to create product'
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to create product'
    });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category, is_available, is_pre_order } = req.body;
    let image_url = null;

    // Get existing product
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.file) {
      try {
        // Delete old image if it exists
        if (existingProduct.image_url) {
          const oldPath = existingProduct.image_url.split('/').slice(-2).join('/');
          await supabaseAdmin.storage
            .from('product-images')
            .remove([oldPath]);
        }

        // Upload new image
        const fileExt = path.extname(req.file.originalname);
        const fileName = `product-${uuidv4()}${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('product-images')
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ 
            error: 'Upload failed',
            message: 'Failed to upload product image'
          });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('product-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      } catch (uploadError) {
        console.error('Error handling image:', uploadError);
        return res.status(500).json({ 
          error: 'Upload failed',
          message: 'Failed to process product image'
        });
      }
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        category,
        is_available: is_available === 'true',
        is_pre_order: is_pre_order === 'true',
        ...(image_url && { image_url })
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return res.status(500).json({ error: 'Failed to update product' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete product with ID: ${id}`);

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      console.error(`Invalid product ID format: ${id}`);
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }

    // Check if product exists before attempting to delete
    console.log(`Checking if product exists: ${id}`);
    const { data: existingProduct, error: checkError } = await supabaseAdmin
      .from('products')
      .select('id, name, image_url')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error(`Error checking if product exists: ${checkError.message}`);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to check if product exists'
      });
    }

    if (!existingProduct) {
      console.error(`Product not found: ${id}`);
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Product not found'
      });
    }

    console.log(`Product found: ${JSON.stringify(existingProduct)}`);

    // Delete image if it exists
    if (existingProduct.image_url) {
      console.log(`Deleting product image: ${existingProduct.image_url}`);
      // Extract the path from the URL
      const imagePath = existingProduct.image_url.split('/').slice(-2).join('/');
      // Delete image from storage
      const { error: storageError } = await supabaseAdmin.storage
        .from('product-images')
        .remove([imagePath]);
      
      if (storageError) {
        console.error(`Error deleting product image: ${storageError.message}`);
        // Continue with product deletion even if image deletion fails
      } else {
        console.log(`Successfully deleted product image: ${imagePath}`);
      }
    }

    // Delete the product
    console.log(`Deleting product from database: ${id}`);
    const { error: deleteError, data: deleteData } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if (deleteError) {
      console.error(`Error deleting product: ${deleteError.message}`, deleteError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to delete product',
        details: deleteError.message
      });
    }

    console.log(`Product deletion result:`, deleteData);
    
    // Verify the product was actually deleted
    const { data: verifyProduct, error: verifyError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
      
    if (verifyError && verifyError.code === 'PGRST116') {
      console.log(`Verified product was deleted successfully: ${id}`);
    } else if (verifyProduct) {
      console.error(`Product still exists after deletion: ${id}`);
      return res.status(500).json({
        error: 'Deletion verification failed',
        message: 'Product appears to still exist after deletion attempt'
      });
    }

    res.json({ 
      message: 'Product deleted successfully',
      productId: id,
      productName: existingProduct.name
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to delete product',
      details: error.message
    });
  }
};

// Add product rating
export const addProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      console.error('Product check error:', productError);
      if (productError.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'Product not found',
          message: 'The requested product does not exist'
        });
      }
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to check product existence'
      });
    }

    const { data: ratingData, error: ratingError } = await supabase
      .from('product_ratings')
      .insert([
        {
          product_id: id,
          user_id,
          rating: parseInt(rating),
          comment
        }
      ])
      .select()
      .single();

    if (ratingError) {
      console.error('Add rating error:', ratingError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to add rating'
      });
    }

    res.status(201).json(ratingData);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to add rating'
    });
  }
};

// Update product availability
export const updateProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'is_available must be a boolean value'
      });
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ is_available })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update product availability error:', error);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update product availability'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product availability error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update product availability'
    });
  }
};

// Update all snack products availability
export const updateSnackProductsAvailability = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        is_available: true,
        stock_quantity: 100
      })
      .eq('category', 'snacks');

    if (error) {
      console.error('Update snack products error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to update snack products availability'
      });
    }

    res.json({ 
      message: 'Successfully updated snack products availability',
      updatedCount: data?.length || 0
    });
  } catch (error) {
    console.error('Update snack products error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update snack products availability'
    });
  }
};

// Get low stock products (admin only)
export const getLowStockProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock_quantity', 10)
      .order('stock_quantity', { ascending: true });

    if (error) {
      console.error('Get low stock products error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch low stock products'
      });
    }

    res.json(products || []);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch low stock products'
    });
  }
};

// Get product statistics (admin only)
export const getProductStats = async (req, res) => {
  try {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Get available products
    const { count: availableProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    // Get low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock_quantity', 10);

    // Get products by category
    const { data: categoryStats } = await supabase
      .from('products')
      .select('category')
      .then(({ data }) => {
        const stats = {};
        data.forEach(product => {
          stats[product.category] = (stats[product.category] || 0) + 1;
        });
        return stats;
      });

    res.json({
      totalProducts,
      availableProducts,
      lowStockProducts,
      categoryStats
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch product statistics'
    });
  }
}; 