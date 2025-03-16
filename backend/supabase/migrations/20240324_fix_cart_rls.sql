-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.shopping_cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES public.shopping_cart(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart" ON public.shopping_cart;
DROP POLICY IF EXISTS "Users can insert their own cart" ON public.shopping_cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.shopping_cart;
DROP POLICY IF EXISTS "Users can delete their own cart" ON public.shopping_cart;
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- Enable RLS on tables
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shopping_cart
CREATE POLICY "Users can view their own cart"
    ON public.shopping_cart FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart"
    ON public.shopping_cart FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
    ON public.shopping_cart FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
    ON public.shopping_cart FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for cart_items
CREATE POLICY "Users can view their own cart items"
    ON public.cart_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own cart items"
    ON public.cart_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own cart items"
    ON public.cart_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own cart items"
    ON public.cart_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation and cart initialization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Determine user role (first user is admin, rest are customers)
    SELECT 
        CASE 
            WHEN NOT EXISTS (SELECT 1 FROM public.profiles) THEN 'admin'
            ELSE 'customer'
        END INTO user_role;

    -- Create profile
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Create shopping cart for customers
    IF user_role = 'customer' THEN
        INSERT INTO public.shopping_cart (user_id)
        VALUES (NEW.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Grant necessary permissions first
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create missing carts for existing customers
DO $$ 
BEGIN
    INSERT INTO public.shopping_cart (user_id)
    SELECT id FROM public.profiles
    WHERE role = 'customer'
    AND NOT EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.user_id = profiles.id
    );
END $$; 