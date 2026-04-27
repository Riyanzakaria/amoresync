CREATE TABLE IF NOT EXISTS spinner_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spinner_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view shared spinner options" ON spinner_options;
DROP POLICY IF EXISTS "Users can insert own spinner options" ON spinner_options;
DROP POLICY IF EXISTS "Users can update shared spinner options" ON spinner_options;
DROP POLICY IF EXISTS "Users can delete shared spinner options" ON spinner_options;

-- Create Policies
CREATE POLICY "Users can view shared spinner options" ON spinner_options
FOR SELECT USING (
    auth.uid() = creator_id OR 
    auth.uid() IN (SELECT partner_id FROM profiles WHERE id = spinner_options.creator_id) OR
    creator_id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert own spinner options" ON spinner_options
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update shared spinner options" ON spinner_options
FOR UPDATE USING (
    auth.uid() = creator_id OR 
    auth.uid() IN (SELECT partner_id FROM profiles WHERE id = spinner_options.creator_id) OR
    creator_id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete shared spinner options" ON spinner_options
FOR DELETE USING (
    auth.uid() = creator_id OR 
    auth.uid() IN (SELECT partner_id FROM profiles WHERE id = spinner_options.creator_id) OR
    creator_id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
);
