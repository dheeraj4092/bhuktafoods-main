import { supabase } from '../config/supabase.js';

export const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Query the eligible_pincodes table to check if the pincode exists
    const { data, error } = await supabase
      .from('eligible_pincodes')
      .select('*')
      .eq('pincode', pincode)
      .single();

    if (error) {
      console.error('Error checking pincode:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check pincode eligibility'
      });
    }

    return res.status(200).json({
      success: true,
      isEligible: !!data,
      message: data ? 'Delivery available' : 'Delivery not available'
    });

  } catch (error) {
    console.error('Error in checkPincode:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 