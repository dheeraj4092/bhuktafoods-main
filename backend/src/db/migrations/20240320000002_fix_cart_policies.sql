-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can create their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON shopping_cart;
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Enable RLS on tables
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_cart table
CREATE POLICY "Users can view their own cart"
ON shopping_cart FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own cart"
ON shopping_cart FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart"
ON shopping_cart FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own cart"
ON shopping_cart FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create policies for cart_items table
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    )
); 