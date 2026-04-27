'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getOrInitializePet() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('partner_id').eq('id', user.id).single()
  
  // Find pet for user or partner
  const { data: existingPet } = await supabase
    .from('virtual_pets')
    .select('*')
    .or(`owner_id.eq.${user.id},owner_id.eq.${profile?.partner_id || user.id}`)
    .limit(1)
    .single()

  if (existingPet) return existingPet

  // Initialize new pet
  const { data: newPet } = await supabase
    .from('virtual_pets')
    .insert({ owner_id: user.id, happiness_level: 50, pet_name: 'Mochi' })
    .select('*')
    .single()

  return newPet
}

export async function feedPet() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const pet = await getOrInitializePet()
  if (!pet) return { error: 'No pet found' }

  const now = new Date()
  const isOwner = user.id === pet.owner_id

  // Determine current effective happiness (Decay Logic)
  const hoursSinceLastInteract = (now.getTime() - new Date(pet.last_interacted_at).getTime()) / (1000 * 60 * 60)
  const decayPoints = Math.floor(hoursSinceLastInteract / 24) * 10
  let currentHappiness = Math.max(0, pet.happiness_level - decayPoints)

  // Check double feed
  let addedHappiness = 20
  let message = 'Yum! +20 Happiness 🐟'
  
  const todayStr = now.toISOString().split('T')[0]
  const partnerLastFed = isOwner ? pet.last_fed_user_b_at : pet.last_fed_user_a_at
  
  if (partnerLastFed && partnerLastFed.startsWith(todayStr)) {
     addedHappiness = 50 // 20 + 30 bonus
     message = 'Kalian berdua kompak memberi makan hari ini! +50 Total Happiness! 💖'
  }

  currentHappiness = Math.min(100, currentHappiness + addedHappiness)

  const updates: any = {
    happiness_level: currentHappiness,
    last_interacted_at: now.toISOString()
  }
  
  if (isOwner) updates.last_fed_user_a_at = now.toISOString()
  else updates.last_fed_user_b_at = now.toISOString()

  const { error } = await supabase.from('virtual_pets').update(updates).eq('id', pet.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true, message, happiness: currentHappiness }
}
