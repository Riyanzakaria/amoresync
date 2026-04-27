'use server'

import { createClient } from '@/utils/supabase/server'

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
    .insert({
      creator_id: user.id,
      content,
      color_theme
    })

  if (error) {
    return { error: error.message }
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
