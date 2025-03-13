-- Drop trigger
DROP TRIGGER IF EXISTS update_shopping_cart_updated_at ON shopping_cart;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON shopping_cart;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON shopping_cart;
DROP POLICY IF EXISTS "Users can update their own cart items" ON shopping_cart;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON shopping_cart;

-- Drop indexes
DROP INDEX IF EXISTS idx_shopping_cart_user;
DROP INDEX IF EXISTS idx_shopping_cart_product;

-- Drop table
DROP TABLE IF EXISTS shopping_cart; 