'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { feedPet } from './PetActions'
import { sendPushToUser } from '@/lib/webpush'

async function getPartnerContext() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id, display_name')
    .eq('id', user.id)
    .single()
  return {
    userId: user.id,
    partnerId: profile?.partner_id ?? null,
    myName: profile?.display_name || 'Pasanganmu',
  }
}

export async function createWishlist(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const target_amount = parseFloat(formData.get('target_amount') as string)
  const category = formData.get('category') as string || 'other'

  if (!title || !target_amount || target_amount <= 0) return { error: 'Invalid input' }

  const { error } = await supabase.from('wishlist_savings').insert({
    creator_id: user.id,
    title,
    target_amount,
    category,
  })

  if (error) return { error: error.message }

  // Push to partner
  const ctx = await getPartnerContext()
  if (ctx?.partnerId) {
    sendPushToUser(ctx.partnerId, {
      title: `🎯 Goal baru: "${title}"!`,
      body: `${ctx.myName} menambahkan goal tabungan baru. Yuk nabung bareng! 💰`,
      url: '/dashboard',
      tag: 'goal-new',
    }).catch(() => {})
  }

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

  if (!wishlist_id || !amount || amount <= 0) return { error: 'Invalid input' }

  // Get goal title for notification
  const { data: goal } = await supabase
    .from('wishlist_savings')
    .select('title')
    .eq('id', wishlist_id)
    .single()

  const { error } = await supabase.from('savings_transactions').insert({
    wishlist_id,
    user_id: user.id,
    amount,
    note,
  })

  if (error) return { error: error.message }

  await feedPet()

  // Push to partner
  const ctx = await getPartnerContext()
  if (ctx?.partnerId && goal?.title) {
    const formatted = new Intl.NumberFormat('id-ID').format(amount)
    sendPushToUser(ctx.partnerId, {
      title: `💰 ${ctx.myName} menabung Rp${formatted}!`,
      body: `Untuk goal "${goal.title}" ${note ? `— ${note}` : ''}`,
      url: '/dashboard',
      tag: 'goal-deposit',
    }).catch(() => {})
  }

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
