-- 1. Extensions & Enums Setup  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
CREATE TYPE wishlist_category AS ENUM ('travel', 'item', 'food', 'other');  
CREATE TYPE coupon_status AS ENUM ('available', 'claimed', 'used');

-- 2. Profiles Table (Core Entity)  
CREATE TABLE profiles (  
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,  
  pairing_code text UNIQUE,  
  partner_id uuid REFERENCES profiles(id),  
  display_name text,  
  avatar_url text,  
  current_mood text DEFAULT '😊',  
  last_active timestamptz DEFAULT now(),  
  created_at timestamptz DEFAULT now()  
);

-- 3. Communication: Post-its Table  
CREATE TABLE post_its (  
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,  
  creator_id uuid REFERENCES profiles(id) NOT NULL,  
  content text CHECK (char_length(content) <= 280),  
  color_theme text DEFAULT 'yellow',  
  is_read boolean DEFAULT false,  
  created_at timestamptz DEFAULT now()  
);

-- 4. Financial Planning: Wishlist Savings  
CREATE TABLE wishlist_savings (  
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,  
  creator_id uuid REFERENCES profiles(id) NOT NULL,  
  title text NOT NULL,  
  target_amount numeric NOT NULL CHECK (target_amount > 0),  
  category wishlist_category DEFAULT 'other',  
  is_completed boolean DEFAULT false,  
  created_at timestamptz DEFAULT now()  
);

-- 5. Financial Logic: Atomic Savings Transactions  
-- Prevents race conditions. Balance is calculated dynamically, not stored in wishlist table.  
CREATE TABLE savings_transactions (  
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,  
  wishlist_id uuid REFERENCES wishlist_savings(id) ON DELETE CASCADE,  
  user_id uuid REFERENCES profiles(id),  
  amount numeric NOT NULL,  
  created_at timestamptz DEFAULT now()  
);

-- 6. Gamification: Coupons Table  
CREATE TABLE coupons (  
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,  
  title text NOT NULL,  
  sender_id uuid REFERENCES profiles(id) NOT NULL,  
  receiver_id uuid REFERENCES profiles(id) NOT NULL,  
  status coupon_status DEFAULT 'available',  
  is_read boolean DEFAULT false,  
  created_at timestamptz DEFAULT now()  
);

-- Enable RLS for all tables  
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE post_its ENABLE ROW LEVEL SECURITY;  
ALTER TABLE wishlist_savings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;  
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy Template: Profiles  
CREATE POLICY "Users can view own and partner profile" ON profiles  
FOR SELECT USING ( auth.uid() = id OR auth.uid() = partner_id );

CREATE POLICY "Users can update own profile" ON profiles  
FOR UPDATE USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK ( auth.uid() = id );

-- Policy Template: Interaction & Finance (Post-its)
CREATE POLICY "Users can view shared post-its" ON post_its  
FOR SELECT USING (   
  auth.uid() = creator_id OR   
  auth.uid() IN (SELECT partner_id FROM profiles WHERE id = post_its.creator_id)   
);

CREATE POLICY "Users can insert own post-its" ON post_its
FOR INSERT WITH CHECK ( auth.uid() = creator_id );

CREATE POLICY "Users can update shared post-its" ON post_its
FOR UPDATE USING (
  auth.uid() = creator_id OR   
  auth.uid() IN (SELECT partner_id FROM profiles WHERE id = post_its.creator_id)
);

CREATE POLICY "Users can delete own post-its" ON post_its
FOR DELETE USING ( auth.uid() = creator_id );


-- =========================================================================
-- RPC FUNCTION FOR SECURE PAIRING (CROSS-MUTATION)
-- =========================================================================
CREATE OR REPLACE FUNCTION pair_users(partner_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS so we can update both users atomically
AS $$
DECLARE
  current_user_id uuid;
  target_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Find the target user by pairing code
  SELECT id INTO target_user_id FROM public.profiles WHERE pairing_code = partner_code LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid pairing code';
  END IF;

  IF target_user_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot pair with yourself';
  END IF;

  -- Check if already paired
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id AND partner_id IS NOT NULL) THEN
    RAISE EXCEPTION 'You are already paired';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND partner_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Target user is already paired';
  END IF;

  -- Perform the cross-mutation atomically
  UPDATE public.profiles SET partner_id = target_user_id WHERE id = current_user_id;
  UPDATE public.profiles SET partner_id = current_user_id WHERE id = target_user_id;

  RETURN true;
END;
$$;
