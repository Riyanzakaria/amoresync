'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function createCoupon(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const receiver_id = formData.get('receiver_id') as string

  if (!title || !receiver_id) return { error: 'Invalid input' }

  const { error } = await supabase.from('coupons').insert({
    title,
    sender_id: user.id,
    receiver_id,
    status: 'available',
  })

  if (error) return { error: error.message }

  // Push to receiver
  const ctx = await getPartnerContext()
  if (ctx?.partnerId) {
    sendPushToUser(ctx.partnerId, {
      title: `🎟️ Kupon baru dari ${ctx.myName}!`,
      body: `"${title}" — klik untuk lihat kuponmu 💕`,
      url: '/dashboard/play',
      tag: 'coupon-new',
    }).catch(() => {})
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCouponStatus(id: string, status: 'claimed' | 'used') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get coupon sender to notify them
  const { data: coupon } = await supabase
    .from('coupons')
    .select('title, sender_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('coupons').update({ status }).eq('id', id)
  if (error) return { error: error.message }

  // Notify the sender that their coupon was claimed/used
  if (coupon?.sender_id && coupon.sender_id !== user.id) {
    const { data: claimer } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const name = claimer?.display_name || 'Pasanganmu'
    const emoji = status === 'claimed' ? '🎟️' : '✅'
    const verb = status === 'claimed' ? 'mengklaim' : 'menggunakan'
    sendPushToUser(coupon.sender_id, {
      title: `${emoji} Kuponmu ${verb}!`,
      body: `${name} ${verb} kupon "${coupon.title}" 💕`,
      url: '/dashboard/play',
      tag: 'coupon-update',
    }).catch(() => {})
  }

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
