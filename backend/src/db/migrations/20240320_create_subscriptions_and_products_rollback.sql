-- Drop triggers
DROP TRIGGER IF EXISTS update_subscription_products_updated_at ON subscription_products;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_subscription_product_mappings_product;
DROP INDEX IF EXISTS idx_subscription_product_mappings_subscription;
DROP INDEX IF EXISTS idx_subscription_products_availability;
DROP INDEX IF EXISTS idx_subscription_products_category;
DROP INDEX IF EXISTS idx_subscriptions_price;
DROP INDEX IF EXISTS idx_subscriptions_active;
DROP INDEX IF EXISTS idx_user_subscriptions_dates;
DROP INDEX IF EXISTS idx_user_subscriptions_status;
DROP INDEX IF EXISTS idx_user_subscriptions_user;

-- Drop tables
DROP TABLE IF EXISTS subscription_product_mappings;
DROP TABLE IF EXISTS subscription_products;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscriptions; 