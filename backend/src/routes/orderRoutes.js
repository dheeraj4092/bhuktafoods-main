import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(authenticateToken);

// Create order
router.post('/', createOrder);

// Get user's orders
router.get('/', getOrders);

// Get single order
router.get('/:id', getOrder);

// Admin routes
router.put('/:id/status', isAdmin, updateOrderStatus);

export default router; 