-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;

-- Create more permissive policies for order creation
CREATE POLICY "Users can create their own orders"
    ON orders FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL -- Allow any authenticated user to create orders
        AND auth.uid() = user_id -- Ensure user can only create orders for themselves
    );

-- Create policy for order items creation
CREATE POLICY "Users can create order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Grant insert permissions
GRANT INSERT ON orders TO authenticated;
GRANT INSERT ON order_items TO authenticated;

-- Create or replace the create_order function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_shipping_address JSONB,
    p_items JSONB[],
    p_total_amount DECIMAL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_order_item JSONB;
    v_order JSONB;
BEGIN
    -- Verify the user is authenticated and matches the provided user_id
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: User ID mismatch';
    END IF;

    -- Create the order
    INSERT INTO orders (
        user_id,
        shipping_address,
        total_amount,
        status,
        payment_status,
        payment_method
    ) VALUES (
        p_user_id,
        p_shipping_address,
        p_total_amount,
        'pending',
        'pending',
        'cod'
    ) RETURNING id INTO v_order_id;

    -- Create order items
    FOR v_order_item IN SELECT * FROM jsonb_array_elements(array_to_json(p_items)::jsonb)
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            quantity_unit,
            price
        ) VALUES (
            v_order_id,
            (v_order_item->>'product_id')::UUID,
            (v_order_item->>'quantity')::INTEGER,
            (v_order_item->>'quantity_unit')::VARCHAR,
            (v_order_item->>'unit_price')::DECIMAL
        );
    END LOOP;

    -- Get the complete order with items
    SELECT jsonb_build_object(
        'order', jsonb_build_object(
            'id', o.id,
            'user_id', o.user_id,
            'total_amount', o.total_amount,
            'status', o.status,
            'shipping_address', o.shipping_address,
            'created_at', o.created_at,
            'order_items', (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'quantity', oi.quantity,
                    'quantity_unit', oi.quantity_unit,
                    'price_at_time', oi.price,
                    'products', jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'image_url', p.image
                    )
                ))
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = o.id
            )
        )
    ) INTO v_order
    FROM orders o
    WHERE o.id = v_order_id;

    RETURN v_order;
END;
$$; 