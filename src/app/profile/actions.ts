'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const display_name = formData.get('display_name') as string
  const avatar_url = formData.get('avatar_url') as string
  const current_mood = formData.get('current_mood') as string

  const updates: any = {}
  if (display_name !== null) updates.display_name = display_name
  if (avatar_url !== null) updates.avatar_url = avatar_url
  if (current_mood !== null) updates.current_mood = current_mood

  if (Object.keys(updates).length === 0) {
    return { error: 'No data to update' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }
  
  if (current_mood !== null) {
    // Upsert to mood_history table
    // Next.js server actions are often in UTC, let's just grab YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('mood_history').upsert({
      user_id: user.id,
      mood: current_mood,
      recorded_date: today
    }, { onConflict: 'user_id, recorded_date' })
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/profile')
  return { success: true }
}
