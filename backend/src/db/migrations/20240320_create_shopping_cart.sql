-- Create shopping_cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_shopping_cart_user ON shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_product ON shopping_cart(product_id);

-- Enable RLS
ALTER TABLE shopping_cart ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own cart items
CREATE POLICY "Users can view their own cart items"
    ON shopping_cart
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to insert their own cart items
CREATE POLICY "Users can insert their own cart items"
    ON shopping_cart
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own cart items
CREATE POLICY "Users can update their own cart items"
    ON shopping_cart
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own cart items
CREATE POLICY "Users can delete their own cart items"
    ON shopping_cart
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_shopping_cart_updated_at
    BEFORE UPDATE ON shopping_cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 