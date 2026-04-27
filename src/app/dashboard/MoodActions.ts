'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMood(mood: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Update profile
  await supabase.from('profiles').update({ current_mood: mood }).eq('id', user.id)

  // Upsert history
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('mood_history').upsert({
    user_id: user.id,
    mood: mood,
    recorded_date: today
  }, { onConflict: 'user_id, recorded_date' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/profile')
  return { success: true }
}
