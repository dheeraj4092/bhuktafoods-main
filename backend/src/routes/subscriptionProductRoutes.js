import express from 'express';
import {
  getSubscriptionProducts,
  getProductsBySubscription,
  createSubscriptionProduct,
  updateSubscriptionProduct,
  deleteSubscriptionProduct,
  updateProductStock,
  toggleProductAvailability
} from '../controllers/subscriptionProductController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSubscriptionProducts);
router.get('/subscription/:subscription_id', getProductsBySubscription);

// Admin routes (requires authentication and admin role)
router.post('/', authenticateToken, isAdmin, createSubscriptionProduct);
router.put('/:id', authenticateToken, isAdmin, updateSubscriptionProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteSubscriptionProduct);
router.put('/:id/stock', authenticateToken, isAdmin, updateProductStock);
router.put('/:id/availability', authenticateToken, isAdmin, toggleProductAvailability);

export default router; 