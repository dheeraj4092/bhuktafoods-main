-- Drop existing cart-related tables and constraints
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.shopping_cart CASCADE;

-- Recreate shopping_cart table with new structure
CREATE TABLE IF NOT EXISTS public.shopping_cart (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES public.shopping_cart ON DELETE CASCADE,
    product_id UUID REFERENCES public.products ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(cart_id, product_id)
);

-- Create indexes for cart tables
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- Enable RLS for cart tables
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shopping_cart
CREATE POLICY "Users can view their own cart"
    ON public.shopping_cart FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own cart"
    ON public.shopping_cart FOR ALL
    USING (auth.uid() = user_id);

-- Create RLS policies for cart_items
CREATE POLICY "Users can view their own cart items"
    ON public.cart_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

CREATE POLICY "Users can modify their own cart items"
    ON public.cart_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.shopping_cart
        WHERE shopping_cart.id = cart_items.cart_id
        AND shopping_cart.user_id = auth.uid()
    ));

-- Modify the handle_new_user function to create shopping cart
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_role TEXT;
BEGIN
    -- Check if user already exists and get their role
    SELECT role INTO existing_role
    FROM public.profiles
    WHERE id = NEW.id;

    -- Only create profile if user doesn't exist or isn't an admin
    IF existing_role IS NULL OR existing_role != 'admin' THEN
        INSERT INTO public.profiles (id, email, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            'customer',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Create shopping cart for new user
        INSERT INTO public.shopping_cart (user_id)
        VALUES (NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create shopping carts for existing users who don't have one
INSERT INTO public.shopping_cart (user_id)
SELECT id FROM public.profiles p
WHERE role = 'customer'
AND NOT EXISTS (
    SELECT 1 FROM public.shopping_cart sc
    WHERE sc.user_id = p.id
); 