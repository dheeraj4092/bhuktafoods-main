import { supabase } from '../config/supabase.js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, items, total_amount } = req.body;

    console.log('Creating order with:', {
      userId,
      shipping_address,
      items,
      total_amount
    });

    // Basic validation
    if (!shipping_address || !items || !total_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'shipping_address, items, and total_amount are required'
      });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid items',
        details: 'Items must be a non-empty array'
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.quantity_unit || !item.unit_price) {
        return res.status(400).json({ 
          error: 'Invalid item format',
          details: `Each item must have product_id, quantity, quantity_unit, and unit_price. Missing fields in item: ${JSON.stringify(item)}`
        });
      }

      // Validate quantity_unit
      if (!['250g', '500g', '1Kg'].includes(item.quantity_unit)) {
        return res.status(400).json({ 
          error: 'Invalid quantity_unit',
          details: `Quantity unit must be one of: 250g, 500g, 1Kg. Got: ${item.quantity_unit}`
        });
      }

      // Validate quantity is positive
      if (item.quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid quantity',
          details: `Quantity must be greater than 0. Got: ${item.quantity} for product ${item.product_id}`
        });
      }
    }

    console.log('Calling create_order RPC with:', {
      p_user_id: userId,
      p_shipping_address: shipping_address,
      p_items: items,
      p_total_amount: total_amount
    });

    // Call the database function to create order
    const { data, error } = await supabase
      .rpc('create_order', {
        p_user_id: userId,
        p_shipping_address: JSON.stringify(shipping_address),
        p_items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          quantity_unit: item.quantity_unit,
          unit_price: item.unit_price
        })),
        p_total_amount: total_amount
      });

    if (error) {
      console.error('Order creation error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Handle specific error cases
      if (error.message?.includes('Insufficient stock')) {
        return res.status(400).json({ 
          error: 'Insufficient stock',
          details: error.message
        });
      }
      
      if (error.message?.includes('Product not found')) {
        return res.status(400).json({ 
          error: 'Product not found',
          details: error.message
        });
      }

      if (error.message?.includes('quantity_unit')) {
        return res.status(400).json({ 
          error: 'Invalid quantity unit',
          details: 'Please ensure all items have a valid quantity unit (250g, 500g, or 1Kg)'
        });
      }

      return res.status(500).json({ 
        error: 'Failed to create order',
        details: error.message || 'An unexpected error occurred while processing your order. Please try again.'
      });
    }

    console.log('Order created successfully:', data);

    // Get order details
    const { data: orderDetails, error: detailsError } = await supabase
      .rpc('get_order_details', { p_order_id: data.order_id });

    if (detailsError) {
      console.error('Error fetching order details:', {
        message: detailsError.message,
        details: detailsError.details,
        hint: detailsError.hint,
        code: detailsError.code
      });
      // Don't fail the order creation if we can't fetch details
      return res.status(201).json({
        success: true,
        order: { id: data.order_id },
        message: 'Order placed successfully'
      });
    }

    // Send email notifications
    try {
      // Send confirmation email to customer
      await sendOrderConfirmationEmail(orderDetails, shipping_address.email);
      
      // Send notification email to admin
      await sendAdminNotificationEmail(orderDetails);
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't fail the order creation if email sending fails
    }

    res.status(201).json({
      success: true,
      order: orderDetails,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Unexpected error in createOrder:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message || 'An unexpected error occurred'
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
          quantity_unit,
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
      .rpc('get_order_details', { p_order_id: id });

    if (error) {
      console.error('Get order error:', error);
      throw new Error('Failed to fetch order');
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
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
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
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

    // Get updated order details
    const { data: orderDetails, error: detailsError } = await supabase
      .rpc('get_order_details', { p_order_id: id });

    if (detailsError) {
      console.error('Error fetching updated order details:', detailsError);
      return res.status(500).json({ error: 'Failed to fetch updated order details' });
    }

    res.json(orderDetails);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      error: error.message || 'Error updating order status',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};