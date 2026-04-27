'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSpinnerOption(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  if (!content) return { error: 'Content is required' }

  const { error } = await supabase
    .from('spinner_options')
    .insert({ creator_id: user.id, content })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteSpinnerOption(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('spinner_options').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
