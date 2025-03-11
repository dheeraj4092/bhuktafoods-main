-- Remove user_id from subscriptions table
ALTER TABLE IF EXISTS public.subscriptions 
DROP COLUMN IF EXISTS user_id; 