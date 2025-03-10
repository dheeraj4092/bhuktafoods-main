import Stripe from 'stripe';
import { supabase } from '../config/supabase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address } = req.body;

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

    if (cartError) throw cartError;

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total and check stock
    let total = 0;
    for (const item of cartItems) {
      if (item.quantity > item.products.stock_quantity) {
        return res.status(400).json({
          error: `Not enough stock available for ${item.products.name}`
        });
      }
      total += item.products.price * item.quantity;
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        shipping_address: JSON.stringify(shipping_address)
      }
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          total_amount: total,
          shipping_address,
          payment_intent_id: paymentIntent.id
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items and update product stock
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price_at_time: item.products.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock_quantity: item.products.stock_quantity - item.quantity
        })
        .eq('id', item.products.id);

      if (stockError) throw stockError;
    }

    // Clear user's cart
    const { error: clearError } = await supabase
      .from('shopping_cart')
      .delete()
      .eq('user_id', userId);

    if (clearError) throw clearError;

    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Error creating order' });
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

    if (error) throw error;

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Error fetching orders' });
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

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const { userId, shipping_address } = paymentIntent.metadata;

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Error updating order status:', updateError);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      
      // Update order status
      const { error: failError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('payment_intent_id', failedPayment.id);

      if (failError) {
        console.error('Error updating order status:', failError);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}; 