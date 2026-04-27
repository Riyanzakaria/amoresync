'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitPairingCode(formData: FormData) {
  const supabase = createClient()
  const partnerCode = formData.get('partner_code') as string

  if (!partnerCode || partnerCode.length !== 6) {
    return { error: 'Invalid pairing code format' }
  }

  // Call the secure RPC function
  const { error } = await supabase.rpc('pair_users', {
    partner_code: partnerCode.toUpperCase(),
  })

  if (error) {
    return { error: error.message || 'Failed to pair with that code' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
