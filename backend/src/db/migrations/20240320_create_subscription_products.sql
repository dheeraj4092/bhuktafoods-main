-- Create subscription_products table
CREATE TABLE subscription_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_product_mappings table for many-to-many relationship
CREATE TABLE subscription_product_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES subscription_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscription_id, product_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_subscription_products_category ON subscription_products(category);
CREATE INDEX idx_subscription_products_availability ON subscription_products(is_available);
CREATE INDEX idx_subscription_product_mappings_subscription ON subscription_product_mappings(subscription_id);
CREATE INDEX idx_subscription_product_mappings_product ON subscription_product_mappings(product_id); 