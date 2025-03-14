import { supabase } from '../config/supabase.js';

export const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    // Validate pincode
    if (!pincode || typeof pincode !== 'string' || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Pincode must be a 6-digit number.'
      });
    }

    // Query the eligible_pincodes table to check if the pincode exists
    const { data, error } = await supabase
      .from('eligible_pincodes')
      .select('pincode')
      .eq('pincode', pincode);

    if (error) {
      console.error('Error checking pincode:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check pincode eligibility. Please try again later.'
      });
    }

    const isEligible = data.length > 0;

    return res.status(200).json({
      success: true,
      isEligible,
      message: isEligible 
        ? 'Delivery available in this area' 
        : 'Delivery not available in this area'
    });

  } catch (error) {
    console.error('Error in checkPincode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};