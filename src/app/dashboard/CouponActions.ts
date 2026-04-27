'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const receiver_id = formData.get('receiver_id') as string

  if (!title || !receiver_id) {
    return { error: 'Invalid input' }
  }

  const { error } = await supabase.from('coupons').insert({
    title,
    sender_id: user.id,
    receiver_id,
    status: 'available'
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCouponStatus(id: string, status: 'claimed' | 'used') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('coupons').update({ status }).eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('coupons').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
