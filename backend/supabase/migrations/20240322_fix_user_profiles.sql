-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into profiles if not exists
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'customer',
        COALESCE(NEW.created_at, NOW()),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = NOW()
    WHERE profiles.email IS NULL OR profiles.email <> EXCLUDED.email;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (you can customize this based on your logging setup)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to sync existing users
CREATE OR REPLACE FUNCTION sync_missing_profiles()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT au.id, au.email, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON p.id = au.id
        WHERE p.id IS NULL
    LOOP
        INSERT INTO public.profiles (id, email, role, created_at, updated_at)
        VALUES (
            auth_user.id,
            auth_user.email,
            'customer',
            COALESCE(auth_user.created_at, NOW()),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            email = EXCLUDED.email,
            updated_at = NOW()
        WHERE profiles.email IS NULL OR profiles.email <> EXCLUDED.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function
SELECT sync_missing_profiles();

-- Verify realtime is enabled for profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$; 