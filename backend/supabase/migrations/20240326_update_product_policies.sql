-- Drop existing product policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Only admins can modify products" ON public.products;

-- Create policy to allow public read access to products
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

-- Create policy to allow admins and service role to modify products
CREATE POLICY "Allow admins and service role to modify products"
ON public.products FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  OR auth.jwt()->>'role' = 'service_role'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  OR auth.jwt()->>'role' = 'service_role'
); 