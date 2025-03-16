import { supabase } from '../config/supabase.js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, items, total_amount } = req.body;

    // Basic validation
    if (!shipping_address || !items || !total_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate items array
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.quantity_unit || !item.unit_price) {
        return res.status(400).json({ 
          error: 'Each item must have product_id, quantity, quantity_unit, and unit_price' 
        });
      }

      // Validate quantity_unit
      if (!['250g', '500g', '1Kg'].includes(item.quantity_unit)) {
        return res.status(400).json({ 
          error: 'Invalid quantity_unit. Must be one of: 250g, 500g, 1Kg' 
        });
      }
    }

    // Call the database function to create order
    const { data, error } = await supabase
      .rpc('create_order', {
        p_user_id: userId,
        p_shipping_address: shipping_address,
        p_items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          quantity_unit: item.quantity_unit,
          unit_price: item.unit_price
        })),
        p_total_amount: total_amount
      });

    if (error) {
      console.error('Order creation error:', error);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Get order details using the new function
    const { data: orderDetails, error: detailsError } = await supabase
      .rpc('get_order_details', { p_order_id: data.order_id });

    if (detailsError) {
      console.error('Error fetching order details:', detailsError);
      return res.status(500).json({ error: 'Failed to fetch order details' });
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
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
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