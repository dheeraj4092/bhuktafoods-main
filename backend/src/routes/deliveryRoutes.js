import express from 'express';
import { checkPincode } from '../controllers/deliveryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Public route for checking pincode delivery eligibility
router.get('/check-pincode', checkPincode);

// Protected route for managing eligible pincodes (admin only)
router.post('/eligible-pincodes', authenticateToken, async (req, res) => {
  try {
    const { pincode, area_name } = req.body;

    // Validate input
    if (!pincode || !area_name) {
      return res.status(400).json({
        success: false,
        message: 'Pincode and area name are required'
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required'
      });
    }

    // Add new eligible pincode
    const { data, error } = await supabase
      .from('eligible_pincodes')
      .insert([{ pincode, area_name }])
      .select();

    if (error) {
      console.error('Error adding eligible pincode:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add eligible pincode'
      });
    }

    return res.status(201).json({
      success: true,
      data,
      message: 'Eligible pincode added successfully'
    });

  } catch (error) {
    console.error('Error in addEligiblePincode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;