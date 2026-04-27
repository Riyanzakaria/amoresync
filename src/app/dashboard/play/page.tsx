import { createClient } from '@/utils/supabase/server'
import CouponBoard from '../CouponBoard'
import TheSpinner from '../TheSpinner'
import EmotionCalendar from '../EmotionCalendar'

export default async function PlayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: spinnerOptions } = await supabase
    .from('spinner_options')
    .select('*')
    .order('created_at', { ascending: true })

  // Get mood history for current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const { data: moodHistory } = await supabase
    .from('mood_history')
    .select('*')
    .gte('recorded_date', firstDayOfMonth)
    .order('recorded_date', { ascending: true })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Gamification: Emotion Calendar */}
      <div>
        <EmotionCalendar 
          moodHistory={moodHistory || []} 
          currentUserId={user.id} 
          partnerId={profile?.partner_id || ''} 
          currentMood={profile?.current_mood || '😊'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Gamification: Spinner */}
        <div>
          <TheSpinner 
            initialOptions={spinnerOptions || []} 
            currentUserId={user.id} 
            partnerId={profile?.partner_id || ''} 
          />
        </div>

        {/* Gamification: Coupons */}
        <div>
          <CouponBoard 
            coupons={coupons || []} 
            currentUserId={user.id} 
            partnerId={profile?.partner_id || ''} 
          />
        </div>
      </div>

    </div>
  )
}
