import express from 'express';
import multer from 'multer';
import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  subscribeUser,
  getUserSubscription,
  cancelSubscription,
  toggleAutoRenewal,
  renewSubscription,
  changeSubscriptionPlan,
  pauseSubscription,
  resumeSubscription,
  getSubscriptionHistory,
  getSubscriptionAnalytics
} from '../controllers/subscriptionController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Public routes
router.get('/', getSubscriptions);

// User routes (requires authentication)
router.get('/user/active', authenticateToken, getUserSubscription);
router.get('/history', authenticateToken, getSubscriptionHistory);
router.get('/analytics', authenticateToken, getSubscriptionAnalytics);
router.post('/subscribe', authenticateToken, subscribeUser);
router.post('/cancel', authenticateToken, cancelSubscription);
router.post('/auto-renew', authenticateToken, toggleAutoRenewal);
router.post('/renew', authenticateToken, renewSubscription);
router.post('/change-plan', authenticateToken, changeSubscriptionPlan);
router.post('/pause', authenticateToken, pauseSubscription);
router.post('/resume', authenticateToken, resumeSubscription);

// Admin routes
router.post('/', authenticateToken, isAdmin, upload.single('image'), createSubscription);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updateSubscription);
router.delete('/:id', authenticateToken, isAdmin, deleteSubscription);

// Parameterized routes should come last
router.get('/:id', getSubscription);

export default router; 