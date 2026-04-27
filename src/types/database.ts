export type WishlistCategory = 'travel' | 'item' | 'food' | 'other'
export type CouponStatus = 'available' | 'claimed' | 'used'

export interface Profile {
  id: string // uuid, Primary Key (REFERENCES auth.users)
  pairing_code: string | null // text, UNIQUE
  partner_id: string | null // uuid, REFERENCES profiles(id)
  display_name: string | null // text
  avatar_url: string | null // text
  current_mood: string | null // text, DEFAULT '😊'
  last_active: string | null // timestamptz, DEFAULT now()
  created_at: string | null // timestamptz, DEFAULT now()
}

export interface PostIt {
  id: string // uuid, Primary Key, DEFAULT uuid_generate_v4()
  creator_id: string // uuid, NOT NULL, REFERENCES profiles(id)
  content: string | null // text, CHECK (char_length(content) <= 280)
  color_theme: string | null // text, DEFAULT 'yellow'
  is_read: boolean | null // boolean, DEFAULT false
  created_at: string | null // timestamptz, DEFAULT now()
}

export interface WishlistSaving {
  id: string // uuid, Primary Key, DEFAULT uuid_generate_v4()
  creator_id: string // uuid, NOT NULL, REFERENCES profiles(id)
  title: string // text, NOT NULL
  target_amount: number // numeric, NOT NULL, CHECK (target_amount > 0)
  category: WishlistCategory | null // wishlist_category, DEFAULT 'other'
  is_completed: boolean | null // boolean, DEFAULT false
  created_at: string | null // timestamptz, DEFAULT now()
}

export interface SavingsTransaction {
  id: string // uuid, Primary Key, DEFAULT uuid_generate_v4()
  wishlist_id: string | null // uuid, REFERENCES wishlist_savings(id) ON DELETE CASCADE
  user_id: string | null // uuid, REFERENCES profiles(id)
  amount: number // numeric, NOT NULL
  created_at: string | null // timestamptz, DEFAULT now()
}

export interface Coupon {
  id: string // uuid, Primary Key, DEFAULT uuid_generate_v4()
  title: string // text, NOT NULL
  sender_id: string // uuid, NOT NULL, REFERENCES profiles(id)
  receiver_id: string // uuid, NOT NULL, REFERENCES profiles(id)
  status: CouponStatus | null // coupon_status, DEFAULT 'available'
  is_read: boolean | null // boolean, DEFAULT false
  created_at: string | null // timestamptz, DEFAULT now()
}

// Supabase Database Wrapper for strictly typed client initialization
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'last_active' | 'current_mood'> & Partial<Profile>
        Update: Partial<Profile>
      }
      post_its: {
        Row: PostIt
        Insert: Omit<PostIt, 'id' | 'created_at' | 'color_theme' | 'is_read'> & Partial<PostIt>
        Update: Partial<PostIt>
      }
      wishlist_savings: {
        Row: WishlistSaving
        Insert: Omit<WishlistSaving, 'id' | 'created_at' | 'category' | 'is_completed'> & Partial<WishlistSaving>
        Update: Partial<WishlistSaving>
      }
      savings_transactions: {
        Row: SavingsTransaction
        Insert: Omit<SavingsTransaction, 'id' | 'created_at'> & Partial<SavingsTransaction>
        Update: Partial<SavingsTransaction>
      }
      coupons: {
        Row: Coupon
        Insert: Omit<Coupon, 'id' | 'created_at' | 'status' | 'is_read'> & Partial<Coupon>
        Update: Partial<Coupon>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      wishlist_category: WishlistCategory
      coupon_status: CouponStatus
    }
  }
}
