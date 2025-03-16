-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shopping_cart
    WHERE shopping_cart.id = cart_items.cart_id
    AND shopping_cart.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_cart
    WHERE shopping_cart.id = cart_items.cart_id
    AND shopping_cart.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
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
USING (
  EXISTS (
    SELECT 1 FROM shopping_cart
    WHERE shopping_cart.id = cart_items.cart_id
    AND shopping_cart.user_id = auth.uid()
  )
); 