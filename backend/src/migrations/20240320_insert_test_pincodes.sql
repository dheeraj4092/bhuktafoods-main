-- Insert test eligible pincodes
INSERT INTO eligible_pincodes (pincode, area_name)
VALUES 
  ('400001', 'Mumbai Central'),
  ('400002', 'Mumbai Fort'),
  ('400003', 'Mumbai Marine Lines'),
  ('400004', 'Mumbai Grant Road'),
  ('400005', 'Mumbai Charni Road'),
  ('400006', 'Mumbai Churchgate'),
  ('400007', 'Mumbai Colaba'),
  ('400008', 'Mumbai Nariman Point'),
  ('400009', 'Mumbai Byculla'),
  ('400010', 'Mumbai Mazgaon')
ON CONFLICT (pincode) DO NOTHING; 