-- Function to sync existing auth users to profiles
CREATE OR REPLACE FUNCTION sync_existing_users()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN 
        SELECT id, email, created_at
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.profiles)
    LOOP
        INSERT INTO public.profiles (id, email, role, created_at, updated_at)
        VALUES (
            auth_user.id,
            auth_user.email,
            'customer',
            COALESCE(auth_user.created_at, NOW()),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to sync existing users
SELECT sync_existing_users(); 