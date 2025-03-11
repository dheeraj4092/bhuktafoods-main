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
  resumeSubscription
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
router.get('/:id', getSubscription);

// User routes (requires authentication)
router.get('/user/active', authenticateToken, getUserSubscription);
router.post('/subscribe', authenticateToken, subscribeUser);
router.post('/cancel', authenticateToken, cancelSubscription);
router.post('/auto-renew', authenticateToken, toggleAutoRenewal);
router.post('/renew', authenticateToken, renewSubscription);
router.post('/change-plan', authenticateToken, changeSubscriptionPlan);
router.post('/pause', authenticateToken, pauseSubscription);
router.post('/resume', authenticateToken, resumeSubscription);

// Admin routes (requires admin role)
router.post('/', authenticateToken, isAdmin, upload.single('image'), createSubscription);
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), updateSubscription);
router.delete('/:id', authenticateToken, isAdmin, deleteSubscription);

export default router; 