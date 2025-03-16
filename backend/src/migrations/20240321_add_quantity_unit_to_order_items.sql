-- Add quantity_unit column to order_items table
ALTER TABLE order_items
ADD COLUMN quantity_unit VARCHAR(10) NOT NULL DEFAULT '250g';

-- Add a check constraint to ensure valid quantity units
ALTER TABLE order_items
ADD CONSTRAINT chk_quantity_unit 
CHECK (quantity_unit IN ('250g', '500g', '1Kg'));

-- Update existing records to have the default value
UPDATE order_items
SET quantity_unit = '250g'
WHERE quantity_unit IS NULL;

-- Update the create_order function to handle quantity_unit
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_items JSONB[],
  p_total_amount DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_item JSONB;
BEGIN
  -- Create the order
  INSERT INTO orders (
    user_id,
    shipping_address,
    total_amount,
    status
  ) VALUES (
    p_user_id,
    p_shipping_address,
    p_total_amount,
    'pending'
  ) RETURNING id INTO v_order_id;

  -- Create order items
  FOREACH v_order_item IN ARRAY p_items
  LOOP
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      quantity_unit,
      price_at_time
    ) VALUES (
      v_order_id,
      (v_order_item->>'product_id')::UUID,
      (v_order_item->>'quantity')::INTEGER,
      (v_order_item->>'quantity_unit')::VARCHAR,
      (v_order_item->>'unit_price')::DECIMAL
    );
  END LOOP;

  -- Return the order ID
  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_order_details function to include quantity_unit
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_order JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'user_id', o.user_id,
    'shipping_address', o.shipping_address,
    'total_amount', o.total_amount,
    'status', o.status,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'quantity_unit', oi.quantity_unit,
        'unit_price', oi.price_at_time,
        'product', (
          SELECT jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'image_url', p.image_url
          )
          FROM products p
          WHERE p.id = oi.product_id
        )
      ))
      FROM order_items oi
      WHERE oi.order_id = o.id
    )
  )
  INTO v_order
  FROM orders o
  WHERE o.id = p_order_id;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 