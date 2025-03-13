-- Create eligible_pincodes table
CREATE TABLE IF NOT EXISTS eligible_pincodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL UNIQUE,
    area_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on pincode for faster lookups
CREATE INDEX IF NOT EXISTS idx_eligible_pincodes_pincode ON eligible_pincodes(pincode);

-- Add RLS policies
ALTER TABLE eligible_pincodes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON eligible_pincodes
    FOR SELECT
    TO public
    USING (true);

-- Allow admin users to insert/update/delete
CREATE POLICY "Allow admin users to manage eligible pincodes" ON eligible_pincodes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_eligible_pincodes_updated_at
    BEFORE UPDATE ON eligible_pincodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 