'use server'

import { createClient } from '@/utils/supabase/server'
import { feedPet } from './PetActions'
import { sendPushToUser } from '@/lib/webpush'

/** Get current user's partner_id and display_name in one query */
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

export async function createPostIt(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const color_theme = formData.get('color_theme') as string || 'yellow'

  if (!content || content.length > 280) {
    return { error: 'Invalid content length' }
  }

  const { error } = await supabase
    .from('post_its')
    .insert({ creator_id: user.id, content, color_theme })

  if (error) return { error: error.message }

  // Passive: pet happiness
  await feedPet()

  // Push notification to partner
  const ctx = await getPartnerContext()
  if (ctx?.partnerId) {
    const preview = content.length > 60 ? content.slice(0, 57) + '…' : content
    sendPushToUser(ctx.partnerId, {
      title: `📝 Pesan baru dari ${ctx.myName}!`,
      body: preview,
      url: '/dashboard',
      tag: 'post-it',
    }).catch(() => {})
  }

  return { success: true }
}

export async function deletePostIt(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('post_its').delete().eq('id', id).eq('creator_id', user.id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function markPostItAsRead(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('post_its').update({ is_read: true }).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
