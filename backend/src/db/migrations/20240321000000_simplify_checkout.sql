-- Drop existing order creation function
DROP FUNCTION IF EXISTS create_order(UUID, JSONB, JSONB[], DECIMAL);

-- Create simplified order creation function
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_items JSONB[],
  p_total_amount DECIMAL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create order
  INSERT INTO orders (user_id, total_amount, shipping_address, status)
  VALUES (p_user_id, p_total_amount, p_shipping_address, 'processing')
  RETURNING id INTO v_order_id;

  -- Create order items and update stock
  FOR v_item IN SELECT * FROM unnest(p_items)
  LOOP
    -- Create order item
    INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::DECIMAL
    );

    -- Update product stock
    UPDATE products
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;

  -- Clear cart items
  DELETE FROM cart_items
  WHERE cart_id IN (
    SELECT id FROM shopping_cart WHERE user_id = p_user_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id
  );
END;
$$;

-- Modify orders table to simplify the structure
ALTER TABLE orders
  ALTER COLUMN shipping_address SET NOT NULL,
  ALTER COLUMN total_amount SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'processing',
  ALTER COLUMN status SET NOT NULL;

-- Modify order_items table to simplify the structure
ALTER TABLE order_items
  ALTER COLUMN order_id SET NOT NULL,
  ALTER COLUMN product_id SET NOT NULL,
  ALTER COLUMN quantity SET NOT NULL,
  ALTER COLUMN price_at_time SET NOT NULL;

-- Add constraints to ensure data integrity
ALTER TABLE orders
  ADD CONSTRAINT valid_order_status 
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

ALTER TABLE order_items
  ADD CONSTRAINT valid_quantity 
  CHECK (quantity > 0);

ALTER TABLE order_items
  ADD CONSTRAINT valid_price 
  CHECK (price_at_time >= 0);

-- Create or update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Add partial index for active orders
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(status) 
WHERE status IN ('pending', 'processing');

-- Add composite index for order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Add trigger to automatically update order status
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If all items are shipped, update order status to shipped
  IF NOT EXISTS (
    SELECT 1 FROM order_items
    WHERE order_id = NEW.order_id
    AND status != 'shipped'
  ) THEN
    UPDATE orders
    SET status = 'shipped'
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_status_trigger
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status();

-- Add function to get order details
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'total_amount', o.total_amount,
    'shipping_address', o.shipping_address,
    'status', o.status,
    'created_at', o.created_at,
    'items', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price_at_time', oi.price_at_time,
          'product', (
            SELECT jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'image_url', p.image_url
            )
            FROM products p
            WHERE p.id = oi.product_id
          )
        )
      )
      FROM order_items oi
      WHERE oi.order_id = o.id
    )
  ) INTO v_order
  FROM orders o
  WHERE o.id = p_order_id;

  RETURN v_order;
END;
$$; 