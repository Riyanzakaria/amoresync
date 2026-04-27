'use client'

import { useMemo, useEffect, useRef } from 'react'
import DailyMoodSelector from './DailyMoodSelector'

export type MoodRecord = {
  id: string
  user_id: string
  mood: string
  recorded_date: string
}

export default function EmotionCalendar({ moodHistory, currentUserId, partnerId, currentMood }: { moodHistory: MoodRecord[], currentUserId: string, partnerId: string, currentMood: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  
  // Group by date
  const moodByDate = useMemo(() => {
    const map = new Map<string, { me: string | null, partner: string | null }>()
    for (let i = 1; i <= daysInMonth; i++) {
      const d = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      map.set(d, { me: null, partner: null })
    }
    moodHistory.forEach(h => {
      if (map.has(h.recorded_date)) {
        const item = map.get(h.recorded_date)!
        if (h.user_id === currentUserId) item.me = h.mood
        if (h.user_id === partnerId) item.partner = h.mood
      }
    })
    return Array.from(map.entries())
  }, [moodHistory, currentUserId, partnerId, daysInMonth, today])

  // Calculate Sync Score
  const syncDays = moodByDate.filter(([_, moods]) => moods.me && moods.partner && moods.me === moods.partner).length
  const daysWithBoth = moodByDate.filter(([_, moods]) => moods.me && moods.partner).length
  const syncScore = daysWithBoth === 0 ? 0 : Math.round((syncDays / daysWithBoth) * 100)

  // Auto scroll to today
  useEffect(() => {
    if (scrollRef.current) {
      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const index = moodByDate.findIndex(([date]) => date === todayDateStr)
      if (index > -1) {
        // approximate item width is 60px + 8px gap
        scrollRef.current.scrollTo({ left: index * 68 - 100, behavior: 'smooth' })
      }
    }
  }, [moodByDate, today])

  return (
    <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 transition-colors duration-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            📅 Emotion Sync
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">See how your feelings align this month.</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 px-5 py-2.5 rounded-2xl border border-rose-100 dark:border-rose-900/50 shadow-inner">
          <span className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest block text-center mb-0.5">Sync Score</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-300 flex items-center justify-center gap-2">
            {syncScore}% {syncScore >= 80 ? '🔥' : '💖'}
          </span>
        </div>
      </div>
      
      {/* Fast Inline Mood Updater */}
      <DailyMoodSelector currentMood={currentMood} />

      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar scroll-smooth relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {moodByDate.map(([date, moods]) => {
          const dayNum = new Date(date).getDate()
          const isToday = new Date(date).toDateString() === today.toDateString()
          const isSync = moods.me && moods.partner && moods.me === moods.partner
          const hasData = moods.me || moods.partner

          return (
            <div 
              key={date} 
              className={`min-w-[64px] flex flex-col items-center p-3 rounded-2xl snap-center shrink-0 border transition-all ${
                isToday 
                  ? 'border-rose-300 dark:border-rose-700/50 bg-rose-50 dark:bg-rose-900/20 shadow-md transform scale-105' 
                  : 'border-stone-100 dark:border-zinc-700/50 bg-stone-50/50 dark:bg-zinc-800/30'
              } ${isSync ? 'ring-2 ring-rose-200 dark:ring-rose-800/50' : ''}`}
            >
              <span className={`text-xs font-black mb-3 ${isToday ? 'text-rose-500 dark:text-rose-400' : 'text-stone-400 dark:text-stone-500'}`}>
                {dayNum}
              </span>
              
              <div className="flex flex-col gap-1 items-center relative">
                <span className={`text-2xl drop-shadow-sm h-8 w-8 flex items-center justify-center rounded-full ${moods.me ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''} ${!moods.me && !isToday && new Date(date) < today ? 'opacity-30' : ''}`}>
                  {moods.me || (new Date(date) <= today ? '❔' : ' ')}
                </span>
                
                <div className="h-4 flex items-center justify-center my-0.5">
                  {isSync ? (
                    <span className="text-[12px] text-rose-500 animate-[pulse_2s_ease-in-out_infinite]">❤️</span>
                  ) : hasData ? (
                    <span className="text-[10px] font-bold text-stone-300 dark:text-zinc-600">vs</span>
                  ) : (
                    <span className="h-[4px] w-[4px] rounded-full bg-stone-200 dark:bg-zinc-700"></span>
                  )}
                </div>
                
                <span className={`text-2xl drop-shadow-sm h-8 w-8 flex items-center justify-center rounded-full ${moods.partner ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''} ${!moods.partner && !isToday && new Date(date) < today ? 'opacity-30' : ''}`}>
                  {moods.partner || (new Date(date) <= today ? '❔' : ' ')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
