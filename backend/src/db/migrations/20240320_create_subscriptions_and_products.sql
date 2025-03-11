-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    restrictions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_subscriptions table
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'completed', 'changed')),
    auto_renew BOOLEAN DEFAULT true,
    pause_start TIMESTAMP WITH TIME ZONE,
    pause_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_dates ON user_subscriptions(start_date, end_date);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_price ON subscriptions(price);
CREATE INDEX idx_subscription_products_category ON subscription_products(category);
CREATE INDEX idx_subscription_products_availability ON subscription_products(is_available);
CREATE INDEX idx_subscription_product_mappings_subscription ON subscription_product_mappings(subscription_id);
CREATE INDEX idx_subscription_product_mappings_product ON subscription_product_mappings(product_id);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_products_updated_at
    BEFORE UPDATE ON subscription_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 