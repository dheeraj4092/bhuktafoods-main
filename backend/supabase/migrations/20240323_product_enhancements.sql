-- Add new columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN (search_vector);

-- Create product variations table
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create trigger for updated_at
CREATE TRIGGER update_product_variations_updated_at
    BEFORE UPDATE ON product_variations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment stock
CREATE OR REPLACE FUNCTION increment_stock(row_id UUID, amount INTEGER)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    UPDATE products
    SET stock = stock + amount
    WHERE id = row_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement stock
CREATE OR REPLACE FUNCTION decrement_stock(row_id UUID, amount INTEGER)
RETURNS SETOF products AS $$
BEGIN
    RETURN QUERY
    UPDATE products
    SET stock = GREATEST(0, stock - amount)
    WHERE id = row_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Create function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock <= NEW.low_stock_threshold AND NEW.stock > 0 THEN
        -- You can implement notification logic here
        -- For now, we'll just raise a notice
        RAISE NOTICE 'Low stock alert for product %: % units remaining', NEW.name, NEW.stock;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock check
CREATE TRIGGER check_product_stock
    AFTER UPDATE OF stock ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_low_stock();

-- Add RLS policies for product variations
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Everyone can view product variations
CREATE POLICY "Anyone can view product variations"
    ON product_variations FOR SELECT
    USING (true);

-- Only admins can manage product variations
CREATE POLICY "Admins can manage product variations"
    ON product_variations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    ); 