import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

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

export const uploadMiddleware = upload.single('image');

// Get all products with search and filtering
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    let query = supabase.from('products').select('*');

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply price range filter
    if (minPrice) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    // Apply sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data: products, error, count } = await query;

    if (error) throw error;

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_reviews (
          id,
          rating,
          comment,
          created_at,
          profiles (
            id,
            full_name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      isAvailable,
      isPreOrder
    } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      // Upload image to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      // Get public URL
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
          price,
          category,
          stock_quantity,
          image_url,
          is_available: isAvailable === 'true',
          is_pre_order: isPreOrder === 'true'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      stock_quantity
    } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      // Upload image to Supabase Storage
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      image_url = publicUrl;
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        category,
        stock_quantity,
        ...(image_url && { image_url }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product to delete image
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete image from storage if exists
    if (product.image_url) {
      const filePath = product.image_url.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting image:', storageError);
      }
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

// Add product rating
export const addProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user has already rated this product
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', id)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already rated this product' });
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from('product_reviews')
      .insert([
        {
          product_id: id,
          user_id: userId,
          rating,
          comment
        }
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    // Update product rating
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('rating, num_reviews')
      .eq('id', id)
      .single();

    if (productError) throw productError;

    const newNumReviews = product.num_reviews + 1;
    const newRating = ((product.rating * product.num_reviews) + rating) / newNumReviews;

    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: newRating,
        num_reviews: newNumReviews
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(201).json(review);
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Error adding rating' });
  }
}; 