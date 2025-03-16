import { supabase, supabaseAdmin } from '../config/supabase.js';

// Helper function to get or create cart
const getOrCreateCart = async (userId) => {
  const { data: carts, error: cartError } = await supabaseAdmin
    .from('shopping_cart')
    .select('id')
    .eq('user_id', userId);

  if (cartError) {
    throw new Error(`Error getting cart: ${cartError.message}`);
  }

  if (!carts || carts.length === 0) {
    const { data: newCart, error: createError } = await supabaseAdmin
      .from('shopping_cart')
      .insert([{ user_id: userId }])
      .select('id')
      .single();

    if (createError) {
      throw new Error(`Error creating cart: ${createError.message}`);
    }
    return newCart.id;
  }

  return carts[0].id;
};

// Helper function to get cart with items
const getCartWithItems = async (cartId) => {
  const { data: cartItems, error: itemsError } = await supabaseAdmin
    .from('cart_items')
    .select(`
      id,
      quantity,
      quantity_unit,
      product:products (
        id,
        name,
        description,
        price,
        image_url,
        category,
        stock_quantity
      )
    `)
    .eq('cart_id', cartId);

  if (itemsError) {
    throw new Error(`Error fetching cart items: ${itemsError.message}`);
  }

  return {
    id: cartId,
    items: cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      quantity_unit: item.quantity_unit || '250g',
      product: item.product
    })),
    total: cartItems.reduce((sum, item) => {
      let price = item.product.price;
      
      // Apply price multipliers based on quantity unit
      switch (item.quantity_unit) {
        case '500g':
          price = item.product.price * 2;
          break;
        case '1Kg':
          price = item.product.price * 4 * 0.9; // 4x price with 10% discount
          break;
        default: // 250g
          price = item.product.price;
      }
      
      return sum + (price * item.quantity);
    }, 0)
  };
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);
    const cart = await getCartWithItems(cartId);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      error: 'Error fetching cart',
      details: error.message 
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1, quantity_unit = '250g' } = req.body;

    // Validate input
    if (!product_id) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Product ID is required'
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Quantity must be a positive number'
      });
    }

    // Validate quantity unit
    if (!['250g', '500g', '1Kg'].includes(quantity_unit)) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Quantity unit must be one of: 250g, 500g, 1Kg'
      });
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId);

    // Get the product and check stock
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity, is_available, category')
      .eq('id', product_id)
      .single();

    if (productError) {
      console.error('Product fetch error:', productError);
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to fetch product details'
      });
    }

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        details: `No product found with ID: ${product_id}`
      });
    }

    // Check stock quantity for all products
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        details: `Only ${product.stock_quantity} units available`
      });
    }

    // Check if item already exists in cart with the same quantity unit
    const { data: existingItem, error: itemError } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .eq('quantity_unit', quantity_unit)
      .single();

    if (itemError && itemError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Cart item check error:', itemError);
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to check cart contents'
      });
    }

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if the new total quantity exceeds available stock
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock',
          details: `Only ${product.stock_quantity} units available. You already have ${existingItem.quantity} in your cart.`
        });
      }

      const { error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) {
        console.error('Cart item update error:', updateError);
        return res.status(500).json({ 
          error: 'Database error',
          details: 'Failed to update cart item'
        });
      }
    } else {
      // Add new item to cart
      const { error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          product_id: product_id,
          quantity: quantity,
          quantity_unit: quantity_unit
        }]);

      if (insertError) {
        console.error('Cart item insert error:', insertError);
        return res.status(500).json({ 
          error: 'Database error',
          details: 'Failed to add item to cart'
        });
      }
    }

    // Get updated cart
    const updatedCart = await getCartWithItems(cartId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity, quantity_unit } = req.body;

    // Validate input
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: 'Positive quantity is required'
      });
    }

    // Validate quantity unit if provided
    if (quantity_unit && !['250g', '500g', '1Kg'].includes(quantity_unit)) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Quantity unit must be one of: 250g, 500g, 1Kg'
      });
    }

    // Get user's cart
    const cartId = await getOrCreateCart(userId);

    // Get cart item and check ownership
    const { data: cartItem, error: itemError } = await supabaseAdmin
      .from('cart_items')
      .select('product_id, quantity_unit')
      .eq('id', id)
      .eq('cart_id', cartId)
      .single();

    if (itemError) {
      return res.status(404).json({ 
        error: 'Cart item not found',
        details: 'The requested item was not found in your cart'
      });
    }

    // Check product stock
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('stock_quantity, is_available, category')
      .eq('id', cartItem.product_id)
      .single();

    if (productError) {
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to check product stock'
      });
    }

    // For snack products, only check stock quantity
    if (product.category === 'snacks') {
      if (product.stock_quantity < quantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock',
          details: `Only ${product.stock_quantity} units available`
        });
      }
    } else {
      // For fresh products, check both availability and stock
      if (!product.is_available || product.stock_quantity < quantity) {
        return res.status(400).json({ 
          error: 'Product unavailable',
          details: !product.is_available 
            ? 'This product is currently out of stock'
            : `Only ${product.stock_quantity} units available`
        });
      }
    }

    // Update cart item
    const updateData = {
      quantity,
      ...(quantity_unit && { quantity_unit })
    };

    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Cart item update error:', updateError);
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to update cart item'
      });
    }

    // Get updated cart
    const updatedCart = await getCartWithItems(cartId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get user's cart
    const cartId = await getOrCreateCart(userId);

    // Remove item
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('cart_id', cartId);

    if (deleteError) {
      throw new Error(`Error removing item from cart: ${deleteError.message}`);
    }

    // Get updated cart
    const updatedCart = await getCartWithItems(cartId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      error: 'Error removing item from cart',
      details: error.message 
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart
    const cartId = await getOrCreateCart(userId);

    // Remove all items
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (deleteError) {
      throw new Error(`Error clearing cart: ${deleteError.message}`);
    }

    res.json({ 
      id: cartId,
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      error: 'Error clearing cart',
      details: error.message 
    });
  }
};