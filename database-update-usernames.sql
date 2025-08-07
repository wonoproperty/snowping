-- SnowPing Database Update - Add Username and User ID columns
-- Run this in your Supabase SQL Editor

-- Add username column (this will error if it already exists, which is fine)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.pings ADD COLUMN username text;
        RAISE NOTICE 'Added username column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'username column already exists';
    END;
END $$;

-- Add user_id column for identifying user sessions
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.pings ADD COLUMN user_id text;
        RAISE NOTICE 'Added user_id column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'user_id column already exists';
    END;
END $$;

-- Create index on user_id for better performance when deleting own pings
CREATE INDEX IF NOT EXISTS idx_pings_user_id ON public.pings (user_id);

-- Update RLS policies to allow users to delete their own pings
DROP POLICY IF EXISTS "Allow all operations on pings" ON public.pings;
CREATE POLICY "Allow all operations on pings" ON public.pings
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: More secure policy (uncomment if you want to restrict access)
-- CREATE POLICY "Allow read for all" ON public.pings FOR SELECT USING (true);
-- CREATE POLICY "Allow insert for all" ON public.pings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow delete own pings" ON public.pings 
--     FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

COMMENT ON COLUMN public.pings.username IS 'Display name of the user who created the ping';
COMMENT ON COLUMN public.pings.user_id IS 'Unique identifier for user session, used for deleting own pings';