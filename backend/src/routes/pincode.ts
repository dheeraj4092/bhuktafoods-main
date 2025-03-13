import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// List of pincodes where delivery is available
const DELIVERY_PINCODES = [
  // Add your delivery pincodes here
  "400001", "400002", "400003", "400004", "400005", // Example pincodes
  "400006", "400007", "400008", "400009", "400010",
  "400011", "400012", "400013", "400014", "400015",
  "400016", "400017", "400018", "400019", "400020",
  "400021", "400022", "400023", "400024", "400025",
  "400026", "400027", "400028", "400029", "400030",
  "400031", "400032", "400033", "400034", "400035",
  "400036", "400037", "400038", "400039", "400040",
  "400041", "400042", "400043", "400044", "400045",
  "400046", "400047", "400048", "400049", "400050",
  "400051", "400052", "400053", "400054", "400055",
  "400056", "400057", "400058", "400059", "400060",
  "400061", "400062", "400063", "400064", "400065",
  "400066", "400067", "400068", "400069", "400070",
  "400071", "400072", "400073", "400074", "400075",
  "400076", "400077", "400078", "400079", "400080",
  "400081", "400082", "400083", "400084", "400085",
  "400086", "400087", "400088", "400089", "400090",
  "400091", "400092", "400093", "400094", "400095",
  "400096", "400097", "400098", "400099", "400100",
];

router.get('/check-pincode', async (req, res) => {
  try {
    const { pincode } = req.query;

    if (!pincode || typeof pincode !== 'string' || pincode.length !== 6) {
      return res.status(400).json({ 
        error: 'Invalid pincode format' 
      });
    }

    // Check if the pincode is in our delivery list
    const isAvailable = DELIVERY_PINCODES.includes(pincode);

    // Store the check in Supabase for analytics
    await supabase.from('pincode_checks').insert({
      pincode,
      is_available: isAvailable,
      checked_at: new Date().toISOString()
    });

    return res.json({ 
      available: isAvailable,
      message: isAvailable 
        ? 'Delivery available in this area' 
        : 'Delivery not available in this area'
    });
  } catch (error) {
    console.error('Error checking pincode:', error);
    return res.status(500).json({ 
      error: 'Failed to check pincode availability' 
    });
  }
});

export default router; 