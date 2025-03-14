import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

const router = express.Router();

router.get('/check-pincode', async (req, res) => {
  try {
    const { pincode } = req.query;

    // Validate pincode
    if (!pincode || typeof pincode !== 'string' || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid pincode format. Pincode must be a 6-digit number.' 
      });
    }

    // Check if the pincode exists in the eligible_pincodes table
    const { data, error } = await supabase
      .from('eligible_pincodes')
      .select('pincode')
      .eq('pincode', pincode);

    if (error) {
      console.error('Error querying eligible pincodes:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to check pincode availability' 
      });
    }

    const isEligible = data.length > 0;

    return res.json({ 
      success: true,
      isEligible,
      message: isEligible 
        ? 'Delivery available in this area' 
        : 'Delivery not available in this area'
    });
  } catch (error) {
    console.error('Error checking pincode:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

export default router;