import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductRating,
  uploadMiddleware
} from '../controllers/productController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/:id/ratings', authenticateToken, addProductRating);

// Admin routes
router.post('/', authenticateToken, isAdmin, uploadMiddleware, createProduct);
router.put('/:id', authenticateToken, isAdmin, uploadMiddleware, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

export default router; 