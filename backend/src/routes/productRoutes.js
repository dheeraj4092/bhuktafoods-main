import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductRating,
  uploadMiddleware,
  checkProductExists
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

// Debug middleware for all routes
router.use((req, res, next) => {
  console.log('Product route matched:', {
    path: req.path,
    method: req.method,
    params: req.params,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// Debug route to check if product exists
router.get('/debug/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await checkProductExists(id);
    res.json({ exists });
  } catch (error) {
    console.error('Debug check error:', error);
    res.status(500).json({ error: 'Failed to check product existence' });
  }
});

// Admin routes (requires admin role) - These must come BEFORE the public routes
router.get('/admin/product/:id', (req, res, next) => {
  console.log('Admin product route matched:', {
    path: req.path,
    method: req.method,
    params: req.params,
    headers: req.headers
  });
  next();
}, authenticateToken, isAdmin, getProduct);

router.post('/admin/product', authenticateToken, isAdmin, uploadMiddleware.single('image'), createProduct);
router.put('/admin/product/:id', authenticateToken, isAdmin, uploadMiddleware.single('image'), updateProduct);
router.delete('/admin/product/:id', authenticateToken, isAdmin, deleteProduct);
router.put('/admin/product/:id/stock', authenticateToken, isAdmin, updateProductStock);
router.get('/admin/low-stock', authenticateToken, isAdmin, getLowStockProducts);
router.post('/admin/product/:id/variations', authenticateToken, isAdmin, addProductVariation);

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);
router.get('/:id/variations', getProductVariations);

// Protected routes (requires authentication)
router.post('/:id/rating', authenticateToken, addProductRating);

export default router; 