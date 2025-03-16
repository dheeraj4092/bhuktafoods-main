import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Test email configuration
router.post('/test-email', isAdmin, async (req, res) => {
  console.log('\n🚀 Starting email test...');
  console.log('Admin email:', process.env.ADMIN_EMAIL);
  console.log('Sender email:', process.env.EMAIL_USER);
  
  try {
    const testOrder = {
      id: 'test-order-123',
      created_at: new Date().toISOString(),
      status: 'pending',
      total_amount: 1000,
      shipping_address: {
        name: 'Test User',
        email: process.env.ADMIN_EMAIL,
        address: '123 Test St',
        city: 'Test City',
        zip_code: '12345'
      },
      items: [
        {
          product: {
            name: 'Test Product'
          },
          quantity: 1,
          quantity_unit: '250g',
          price_at_time: 1000
        }
      ]
    };

    console.log('Test order created:', testOrder);

    // Send test emails
    console.log('\n📧 Sending test emails...');
    await Promise.all([
      sendOrderConfirmationEmail(testOrder, process.env.ADMIN_EMAIL),
      sendAdminNotificationEmail(testOrder)
    ]);

    console.log('✅ Test emails sent successfully');
    res.json({ message: 'Test emails sent successfully' });
  } catch (error) {
    console.error('❌ Test email error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to send test emails',
      details: error.message
    });
  }
});

// Create order
router.post('/', createOrder);

// Get user's orders
router.get('/', getOrders);

// Get single order
router.get('/:id', getOrder);

// Admin routes
router.put('/:id/status', isAdmin, updateOrderStatus);

export default router;