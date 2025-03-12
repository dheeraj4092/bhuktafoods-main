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
import {
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  updateProductStock,
  getLowStockProducts,
  addProductVariation,
  getProductVariations
} from '../controllers/productEnhancedController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/variations', getProductVariations);

// Protected routes
router.post('/:id/ratings', authenticateToken, addProductRating);

// Admin routes
router.post('/', authenticateToken, isAdmin, uploadMiddleware, createProduct);
router.put('/:id', authenticateToken, isAdmin, uploadMiddleware, updateProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);
router.put('/:id/stock', authenticateToken, isAdmin, updateProductStock);
router.get('/admin/low-stock', authenticateToken, isAdmin, getLowStockProducts);
router.post('/:id/variations', authenticateToken, isAdmin, addProductVariation);

export default router; 