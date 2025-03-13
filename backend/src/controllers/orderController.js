import { supabase } from '../config/supabase.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address } = req.body;

    // Validate shipping address
    if (!shipping_address || !shipping_address.name || !shipping_address.email || 
        !shipping_address.address || !shipping_address.city || !shipping_address.zipCode) {
      return res.status(400).json({ error: 'Shipping address is incomplete' });
    }

    // Get user's cart
    const { data: cartItems, error: cartError } = await supabase
      .from('shopping_cart')
      .select(`
        quantity,
        products (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq('user_id', userId);

    if (cartError) {
      console.error('Cart fetch error:', cartError);
      throw new Error('Failed to fetch cart items');
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total and check stock
    let total = 0;
    for (const item of cartItems) {
      if (!item.products) {
        return res.status(400).json({
          error: `Product not found in cart item`
        });
      }
      
      if (item.quantity > item.products.stock_quantity) {
        return res.status(400).json({
          error: `Not enough stock available for ${item.products.name}`
        });
      }
      total += item.products.price * item.quantity;
    }

    // Start a transaction by using a single request
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: total,
          shipping_address,
          status: 'processing' // Set initial status as processing
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price_at_time: item.products.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw new Error('Failed to create order items');
    }

    // Update product stock
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock_quantity: item.products.stock_quantity - item.quantity
        })
        .eq('id', item.products.id);

      if (stockError) {
        console.error('Stock update error:', stockError);
        throw new Error('Failed to update product stock');
      }
    }

    // Clear user's cart
    const { error: clearError } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    if (clearError) {
      console.error('Cart clear error:', clearError);
      throw new Error('Failed to clear cart');
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating order',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get orders error:', error);
      throw new Error('Failed to fetch orders');
    }

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      error: error.message || 'Error fetching orders',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
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
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get order error:', error);
      throw new Error('Failed to fetch order');
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      error: error.message || 'Error fetching order',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update order status error:', error);
      throw new Error('Failed to update order status');
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      error: error.message || 'Error updating order status',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 