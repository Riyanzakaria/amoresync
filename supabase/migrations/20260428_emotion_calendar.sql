CREATE TABLE IF NOT EXISTS mood_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(user_id, recorded_date)
);

ALTER TABLE mood_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shared mood history" ON mood_history
FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT partner_id FROM profiles WHERE id = mood_history.user_id) OR
    user_id IN (SELECT partner_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert own mood history" ON mood_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood history" ON mood_history
FOR UPDATE USING (auth.uid() = user_id);
