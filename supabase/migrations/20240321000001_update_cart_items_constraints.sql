-- Drop the existing unique constraint
ALTER TABLE public.cart_items
DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_key;

-- Add new unique constraint that includes quantity_unit
ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_cart_id_product_id_quantity_unit_key
UNIQUE (cart_id, product_id, quantity_unit);

-- Add check constraint for quantity_unit if it doesn't exist
ALTER TABLE public.cart_items
ADD CONSTRAINT cart_items_quantity_unit_check
CHECK (quantity_unit IN ('250g', '500g', '1Kg'));

-- Set default value for quantity_unit if it doesn't exist
ALTER TABLE public.cart_items
ALTER COLUMN quantity_unit SET DEFAULT '250g';

-- Update existing records to set default value for quantity_unit where it is NULL
UPDATE public.cart_items
SET quantity_unit = '250g'
WHERE quantity_unit IS NULL; 