-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can create their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert items into their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Enable RLS on shopping_cart table
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cart_items table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy for shopping_cart table
CREATE POLICY "Users can view their own cart"
ON shopping_cart
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cart"
ON shopping_cart
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own cart"
ON shopping_cart
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy for cart_items table
CREATE POLICY "Users can view their own cart items"
ON cart_items
FOR SELECT
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items into their own cart"
ON cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items"
ON cart_items
FOR UPDATE
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own cart items"
ON cart_items
FOR DELETE
TO authenticated
USING (
  cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = auth.uid()
  )
); 