-- Add quantity_unit column to cart_items table
ALTER TABLE cart_items
ADD COLUMN quantity_unit VARCHAR(10) NOT NULL DEFAULT '250g';

-- Add a check constraint to ensure valid quantity units
ALTER TABLE cart_items
ADD CONSTRAINT chk_cart_items_quantity_unit 
CHECK (quantity_unit IN ('250g', '500g', '1Kg'));

-- Update existing records to have the default value
UPDATE cart_items
SET quantity_unit = '250g'
WHERE quantity_unit IS NULL; 