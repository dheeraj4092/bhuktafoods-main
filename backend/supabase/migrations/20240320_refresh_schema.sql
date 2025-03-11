-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view active subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

-- Create RLS policies for subscriptions
CREATE POLICY "Public can view active subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage subscriptions"
    ON public.subscriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
    ON public.user_subscriptions
    FOR ALL
    USING (auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    ); 