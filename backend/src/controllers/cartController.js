import { supabase, supabaseAdmin } from '../config/supabase.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: cartItems, error } = await supabase
      .from('shopping_cart')
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          description,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Calculate total and format response
    const cart = {
      items: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.products
      })),
      total: cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0)
    };

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    console.log('Adding to cart:', { userId, product_id, quantity });

    // First, get the product by its ID
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', product_id)
      .single();

    if (productError) {
      console.error('Product lookup error:', productError);
      return res.status(404).json({ 
        error: 'Product not found',
        details: productError.message 
      });
    }

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        details: `No product found with ID: ${product_id}`
      });
    }

    console.log('Found product:', product);

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ 
        error: 'Not enough stock available',
        details: `Only ${product.stock_quantity} units available for ${product.name}`
      });
    }

    // Check if item already exists in cart
    const { data: existingItem, error: cartError } = await supabaseAdmin
      .from('shopping_cart')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .single();

    if (cartError && cartError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Cart check error:', cartError);
      throw cartError;
    }

    let result;
    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ 
          error: 'Not enough stock available',
          details: `Only ${product.stock_quantity} units available for ${product.name}`
        });
      }

      const { data, error } = await supabaseAdmin
        .from('shopping_cart')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update cart error:', error);
        throw error;
      }
      result = data;
    } else {
      // Add new item if it doesn't exist
      const cartItem = {
        user_id: userId,
        product_id: product.id,
        quantity
      };
      
      console.log('Inserting cart item:', cartItem);
      
      const { data, error } = await supabaseAdmin
        .from('shopping_cart')
        .insert([cartItem])
        .select()
        .single();

      if (error) {
        console.error('Insert cart error:', error);
        throw error;
      }
      result = data;
    }

    console.log('Successfully added to cart:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      error: 'Error adding item to cart',
      details: error.message
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // Check if item exists in cart
    const { data: cartItem, error: cartError } = await supabase
      .from('shopping_cart')
      .select('product_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (cartError) throw cartError;

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check if product has enough stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', cartItem.product_id)
      .single();

    if (productError) throw productError;

    if (quantity > product.stock_quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Update quantity
    const { data, error } = await supabase
      .from('shopping_cart')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Error updating cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
}; 