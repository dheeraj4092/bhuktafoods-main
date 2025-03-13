-- Enable RLS
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart"
ON shopping_cart FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
ON shopping_cart FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
ON shopping_cart FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
ON shopping_cart FOR DELETE
USING (auth.uid() = user_id); 