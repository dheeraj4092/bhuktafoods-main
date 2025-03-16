-- Create a function to handle order creation with transaction support
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

-- Then, create the indexes
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