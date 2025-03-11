import { supabase } from '../config/supabase.js';

// Get all products available for subscriptions
export const getSubscriptionProducts = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('subscription_products')
      .select(`
        *,
        subscriptions:subscription_product_mappings(subscription_id)
      `)
      .order('name');

    if (error) throw error;
    res.json(products);
  } catch (error) {
    console.error('Get subscription products error:', error);
    res.status(500).json({ error: 'Error fetching subscription products' });
  }
};

// Get products for a specific subscription
export const getProductsBySubscription = async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const { data: products, error } = await supabase
      .from('subscription_product_mappings')
      .select(`
        subscription_products (*)
      `)
      .eq('subscription_id', subscription_id);

    if (error) throw error;
    res.json(products.map(p => p.subscription_products));
  } catch (error) {
    console.error('Get subscription products error:', error);
    res.status(500).json({ error: 'Error fetching subscription products' });
  }
};

// Create a new product for subscriptions
export const createSubscriptionProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image_url,
      is_available,
      stock_quantity,
      subscription_ids
    } = req.body;

    // Start a transaction
    const { data: product, error: productError } = await supabase
      .from('subscription_products')
      .insert([
        {
          name,
          description,
          price,
          category,
          image_url,
          is_available: is_available ?? true,
          stock_quantity: stock_quantity ?? 0
        }
      ])
      .select()
      .single();

    if (productError) throw productError;

    // If subscription IDs are provided, create mappings
    if (subscription_ids && subscription_ids.length > 0) {
      const mappings = subscription_ids.map(subscription_id => ({
        subscription_id,
        product_id: product.id
      }));

      const { error: mappingError } = await supabase
        .from('subscription_product_mappings')
        .insert(mappings);

      if (mappingError) throw mappingError;
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Create subscription product error:', error);
    res.status(500).json({ error: 'Error creating subscription product' });
  }
};

// Update a subscription product
export const updateSubscriptionProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      image_url,
      is_available,
      stock_quantity,
      subscription_ids
    } = req.body;

    // Update product details
    const { data: product, error: productError } = await supabase
      .from('subscription_products')
      .update({
        name,
        description,
        price,
        category,
        image_url,
        is_available,
        stock_quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) throw productError;

    // Update subscription mappings if provided
    if (subscription_ids) {
      // Delete existing mappings
      const { error: deleteError } = await supabase
        .from('subscription_product_mappings')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Create new mappings
      if (subscription_ids.length > 0) {
        const mappings = subscription_ids.map(subscription_id => ({
          subscription_id,
          product_id: id
        }));

        const { error: mappingError } = await supabase
          .from('subscription_product_mappings')
          .insert(mappings);

        if (mappingError) throw mappingError;
      }
    }

    res.json(product);
  } catch (error) {
    console.error('Update subscription product error:', error);
    res.status(500).json({ error: 'Error updating subscription product' });
  }
};

// Delete a subscription product
export const deleteSubscriptionProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete product mappings first
    const { error: mappingError } = await supabase
      .from('subscription_product_mappings')
      .delete()
      .eq('product_id', id);

    if (mappingError) throw mappingError;

    // Delete the product
    const { error: productError } = await supabase
      .from('subscription_products')
      .delete()
      .eq('id', id);

    if (productError) throw productError;

    res.json({ message: 'Subscription product deleted successfully' });
  } catch (error) {
    console.error('Delete subscription product error:', error);
    res.status(500).json({ error: 'Error deleting subscription product' });
  }
};

// Update product stock
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    const { data: product, error } = await supabase
      .from('subscription_products')
      .update({
        stock_quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Error updating product stock' });
  }
};

// Toggle product availability
export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const { data: product, error } = await supabase
      .from('subscription_products')
      .update({
        is_available,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(product);
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Error toggling product availability' });
  }
}; 