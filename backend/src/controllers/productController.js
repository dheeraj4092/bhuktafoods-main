import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';

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
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: `Please provide: ${missingFields.join(', ')}`
      });
    }

    const {
      name,
      description,
      price,
      category,
      stock_quantity = 0,
      is_available = true,
      is_pre_order = false
    } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `product-${uuidv4()}${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Upload failed',
          message: 'Failed to upload product image'
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          category,
          image_url,
          stock_quantity: parseInt(stock_quantity),
          is_available: is_available === 'true' || is_available === true,
          is_pre_order: is_pre_order === 'true' || is_pre_order === true
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

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError) {
      console.error('Product check error:', checkError);
      if (checkError.code === 'PGRST116') {
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

    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      is_available,
      is_pre_order
    } = req.body;

    // Handle image upload
    let image_url = undefined;
    if (req.file) {
      try {
        // Delete old image if it exists
        if (existingProduct.image_url) {
          const oldPath = existingProduct.image_url.split('/').slice(-2).join('/');
          await supabase.storage
            .from('product-images')
            .remove([oldPath]);
        }

        // Upload new image
        const fileExt = path.extname(req.file.originalname);
        const fileName = `product-${uuidv4()}${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
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

        const { data: { publicUrl } } = supabase.storage
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

    // Prepare update data
    const updateData = {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      category,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : undefined,
      is_available: is_available !== undefined ? (is_available === 'true' || is_available === true) : undefined,
      is_pre_order: is_pre_order !== undefined ? (is_pre_order === 'true' || is_pre_order === true) : undefined,
      updated_at: new Date().toISOString()
    };

    // Only update image_url if we have a new one
    if (image_url !== undefined) {
      updateData.image_url = image_url;
    }

    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update product error:', updateError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to update product'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update product'
    });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        message: 'Please provide a valid product ID'
      });
    }

    // Get current product to delete image if it exists
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    if (product?.image_url) {
      // Extract the path from the URL
      const imagePath = product.image_url.split('/').slice(-2).join('/');
      // Delete image from storage
      await supabase.storage
        .from('product-images')
        .remove([imagePath]);
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to delete product'
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to delete product'
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