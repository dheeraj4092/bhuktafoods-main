-- Insert sample products
INSERT INTO products (name, description, price, image, category, is_available, is_pre_order, delivery_estimate, shipping, preparation, ingredients, stock)
VALUES 
(
    'Classic Chocolate Chip Cookies',
    'Our signature chocolate chip cookies made with premium Belgian chocolate and real butter. Perfectly crispy on the outside and chewy on the inside.',
    12.99,
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'cookies',
    true,
    false,
    '1-2 days',
    '{"method": "standard", "cost": 5.99}',
    '{"time": "2-3 days", "instructions": "Baked fresh to order"}',
    ARRAY['Flour', 'Butter', 'Brown Sugar', 'Chocolate Chips', 'Vanilla Extract', 'Eggs'],
    50
),
(
    'Gourmet Brownie Box',
    'Rich, fudgy brownies topped with sea salt and premium chocolate ganache. Each box contains 6 individually wrapped brownies.',
    24.99,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'brownies',
    true,
    false,
    '1-2 days',
    '{"method": "standard", "cost": 5.99}',
    '{"time": "2-3 days", "instructions": "Baked fresh to order"}',
    ARRAY['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Sea Salt'],
    30
),
(
    'Seasonal Pumpkin Spice Cake',
    'Moist pumpkin cake with cream cheese frosting and a sprinkle of cinnamon. Perfect for fall celebrations.',
    29.99,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'cakes',
    true,
    true,
    '2-3 days',
    '{"method": "express", "cost": 8.99}',
    '{"time": "3-4 days", "instructions": "Made to order with fresh ingredients"}',
    ARRAY['Pumpkin', 'Cinnamon', 'Nutmeg', 'Ginger', 'Cream Cheese', 'Vanilla'],
    20
); 