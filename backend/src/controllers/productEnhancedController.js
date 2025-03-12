import { supabase } from '../config/supabase.js';

// Search products with advanced filtering
export const searchProducts = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      inStock,
      rating,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    let queryBuilder = supabase
      .from('products')
      .select('*, ratings(rating)', { count: 'exact' });

    // Full-text search on name and description
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Category filter
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    // Price range filter
    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', minPrice);
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      queryBuilder = queryBuilder.gt('stock', 0);
    }

    // Rating filter
    if (rating) {
      queryBuilder = queryBuilder.gte('average_rating', rating);
    }

    // Sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    queryBuilder = queryBuilder.range(start, end);

    const { data: products, error, count } = await queryBuilder;

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
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Error searching products' });
  }
};

// Get products by category with aggregations
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        ratings (
          rating
        )
      `)
      .eq('category', category)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (error) throw error;

    // Calculate category statistics
    const stats = {
      totalProducts: products.length,
      averagePrice: products.reduce((acc, p) => acc + parseFloat(p.price), 0) / products.length,
      inStock: products.filter(p => p.stock > 0).length,
      averageRating: products.reduce((acc, p) => {
        const ratings = p.ratings || [];
        const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / (ratings.length || 1);
        return acc + avg;
      }, 0) / products.length
    };

    res.json({ products, stats });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Error fetching products by category' });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        ratings (
          rating
        )
      `)
      .gt('average_rating', 4)
      .gt('stock', 0)
      .limit(limit);

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Error fetching featured products' });
  }
};

// Update product stock
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body;

    if (!['set', 'increment', 'decrement'].includes(operation)) {
      return res.status(400).json({ error: 'Invalid operation' });
    }

    let updateQuery = supabase.from('products');

    switch (operation) {
      case 'set':
        updateQuery = updateQuery.update({ stock });
        break;
      case 'increment':
        updateQuery = updateQuery.rpc('increment_stock', { row_id: id, amount: stock });
        break;
      case 'decrement':
        updateQuery = updateQuery.rpc('decrement_stock', { row_id: id, amount: stock });
        break;
    }

    const { data: product, error } = await updateQuery
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Check if stock is low and send notification
    if (product.stock <= product.low_stock_threshold) {
      // TODO: Implement notification system
      console.log(`Low stock alert for product ${product.name}`);
    }

    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Error updating product stock' });
  }
};

// Get low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', threshold)
      .gt('stock', 0)
      .order('stock', { ascending: true });

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Error fetching low stock products' });
  }
};

// Add product variation
export const addProductVariation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, attributes } = req.body;

    const { data: variation, error } = await supabase
      .from('product_variations')
      .insert([
        {
          product_id: id,
          name,
          price,
          stock,
          attributes
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(variation);
  } catch (error) {
    console.error('Add variation error:', error);
    res.status(500).json({ error: 'Error adding product variation' });
  }
};

// Get product variations
export const getProductVariations = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: variations, error } = await supabase
      .from('product_variations')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(variations);
  } catch (error) {
    console.error('Get variations error:', error);
    res.status(500).json({ error: 'Error fetching product variations' });
  }
}; 