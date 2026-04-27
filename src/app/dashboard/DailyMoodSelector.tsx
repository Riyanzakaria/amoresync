'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateMood } from './MoodActions'

const MOODS = ['😊', '😂', '🥺', '😡', '😴', '🥰', '😭', '🤯', '🤧', '🤢', '😎', '🤒']

export default function DailyMoodSelector({ currentMood }: { currentMood: string }) {
  const [mood, setMood] = useState(currentMood)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (m: string) => {
    if (m === mood) return
    setLoading(true)
    setMood(m)
    await updateMood(m)
    setLoading(false)
  }

  return (
    <div className="bg-stone-50 dark:bg-zinc-900/50 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4 items-center border border-stone-100 dark:border-zinc-800">
       <span className="text-sm font-bold text-stone-500 dark:text-stone-400 whitespace-nowrap">
         How are you feeling today?
       </span>
       <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start flex-1">
         {MOODS.map(m => (
           <button
             key={m}
             onClick={() => handleSelect(m)}
             disabled={loading}
             className={`text-2xl p-1.5 rounded-xl transition-all ${mood === m ? 'bg-rose-100 dark:bg-rose-900/40 scale-110 shadow-sm border border-rose-200 dark:border-rose-700' : 'hover:bg-stone-200 dark:hover:bg-zinc-700/50 grayscale hover:grayscale-0'}`}
             title={m}
           >
             {m}
           </button>
         ))}
       </div>
       {loading && <Loader2 size={20} className="animate-spin text-rose-400 shrink-0" />}
    </div>
  )
}
