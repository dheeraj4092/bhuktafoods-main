-- Add quantity_unit column to order_details table
ALTER TABLE order_details
ADD COLUMN quantity_unit VARCHAR(10) NOT NULL DEFAULT '250g';

-- Add a check constraint to ensure valid quantity units
ALTER TABLE order_details
ADD CONSTRAINT chk_quantity_unit 
CHECK (quantity_unit IN ('250g', '500g', '1Kg'));

-- Update existing records to have the default value
UPDATE order_details
SET quantity_unit = '250g'
WHERE quantity_unit IS NULL; 