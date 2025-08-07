-- SnowPing Database Setup
-- Run this in your Supabase SQL Editor

-- First, check if the pings table exists, if not create it
CREATE TABLE IF NOT EXISTS public.pings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('here', 'meet', 'sos')),
    latitude real NOT NULL,
    longitude real NOT NULL,
    message text DEFAULT '',
    group_code text NOT NULL,
    timestamp timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- If the table already exists, add the group_code column (this will error if it already exists, which is fine)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.pings ADD COLUMN group_code text;
        RAISE NOTICE 'Added group_code column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'group_code column already exists';
    END;
END $$;

-- Make group_code required for new records
ALTER TABLE public.pings ALTER COLUMN group_code SET NOT NULL;

-- Create an index on group_code for better performance
CREATE INDEX IF NOT EXISTS idx_pings_group_code ON public.pings (group_code);

-- Create an index on timestamp for better ordering performance  
CREATE INDEX IF NOT EXISTS idx_pings_timestamp ON public.pings (timestamp DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
DROP POLICY IF EXISTS "Allow all operations on pings" ON public.pings;
CREATE POLICY "Allow all operations on pings" ON public.pings
    FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions to anon and authenticated users
GRANT ALL ON public.pings TO anon;
GRANT ALL ON public.pings TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;