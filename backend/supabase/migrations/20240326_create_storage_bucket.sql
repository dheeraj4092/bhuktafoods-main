-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete product images" ON storage.objects;

-- Create storage policy to allow public read access to product images
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Create storage policy to allow admins and service role to upload product images
CREATE POLICY "Allow admins and service role to upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR auth.jwt()->>'role' = 'service_role'
  )
);

-- Create storage policy to allow admins and service role to delete product images
CREATE POLICY "Allow admins and service role to delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    OR auth.jwt()->>'role' = 'service_role'
  )
); 