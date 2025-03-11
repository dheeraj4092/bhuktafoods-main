import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// Regular client for user operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      jwtSecret: process.env.JWT_SECRET
    }
  }
);

// Admin client for administrative operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      jwtSecret: process.env.JWT_SECRET
    }
  }
);

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SUBSCRIPTIONS: 'subscriptions',
  USER_SUBSCRIPTIONS: 'user_subscriptions'
}; 