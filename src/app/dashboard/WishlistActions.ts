'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { feedPet } from './PetActions'

export async function createWishlist(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const target_amount = parseFloat(formData.get('target_amount') as string)
  const category = formData.get('category') as string || 'other'

  if (!title || !target_amount || target_amount <= 0) {
    return { error: 'Invalid input' }
  }

  const { error } = await supabase.from('wishlist_savings').insert({
    creator_id: user.id,
    title,
    target_amount,
    category
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function depositSavings(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const wishlist_id = formData.get('wishlist_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const note = formData.get('note') as string

  if (!wishlist_id || !amount || amount <= 0) {
    return { error: 'Invalid input' }
  }

  const { error } = await supabase.from('savings_transactions').insert({
    wishlist_id,
    user_id: user.id,
    amount,
    note
  })

  if (error) return { error: error.message }
  
  // Passive Trigger: Give pet some happiness
  await feedPet()

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteWishlist(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('wishlist_savings').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
