'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { addSpinnerOption, deleteSpinnerOption } from './SpinnerActions'
import { Dices, Trash2, Loader2, Sparkles } from 'lucide-react'

export type SpinnerOption = {
  id: string
  creator_id: string
  content: string
}

const sliceColors = [
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316'  // orange-500
]

export default function TheSpinner({ initialOptions, currentUserId, partnerId }: { initialOptions: SpinnerOption[], currentUserId: string, partnerId: string }) {
  const [options, setOptions] = useState<SpinnerOption[]>(initialOptions)
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  
  const formRef = useRef<HTMLFormElement>(null)
  const channelRef = useRef<any>(null)
  const supabase = createClient()

  // Room name for real-time spin sync
  const roomName = `couple_${[currentUserId, partnerId].sort().join('_')}_spinner`

  // Update local options if props change
  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  // Setup real-time listeners for spin sync
  useEffect(() => {
    if (!partnerId) return

    const channel = supabase.channel(roomName, { config: { broadcast: { ack: false } } })
    
    channel.on('broadcast', { event: 'spin_wheel' }, (payload) => {
      const data = payload.payload
      if (data?.sender_id !== currentUserId) {
        setIsSpinning(true)
        setWinner(null)
        setRotation(data.targetRotation)
        
        // Auto stop spinning state
        setTimeout(() => {
          setIsSpinning(false)
          if (data.winnerContent) setWinner(data.winnerContent)
        }, 5000)
      }
    }).subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, partnerId, roomName, supabase])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await addSpinnerOption(formData)
    formRef.current?.reset()
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    await deleteSpinnerOption(id)
    setLoading(false)
  }

  const spin = () => {
    if (isSpinning || options.length === 0) return
    
    setIsSpinning(true)
    setWinner(null)

    // Calculate random target
    const spins = 5 + Math.floor(Math.random() * 5) // 5 to 9 full spins
    const extraDegree = Math.floor(Math.random() * 360)
    const targetRotation = rotation + (spins * 360) + extraDegree
    
    // Determine winner locally
    // Final angle relative to the wheel
    const finalAngle = (360 - (targetRotation % 360)) % 360
    const sliceAngle = 360 / options.length
    const winnerIndex = Math.floor(finalAngle / sliceAngle)
    const winnerContent = options[winnerIndex]?.content

    setRotation(targetRotation)

    // Broadcast
    if (partnerId && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'spin_wheel',
        payload: { sender_id: currentUserId, targetRotation, winnerContent }
      })
    }

    setTimeout(() => {
      setIsSpinning(false)
      setWinner(winnerContent)
    }, 5000)
  }

  // Calculate conic gradient
  const n = Math.max(options.length, 1)
  const gradientStr = options.length === 0 
    ? '#e5e7eb 0deg 360deg'
    : options.map((_, i) => `${sliceColors[i % sliceColors.length]} ${i * 360 / n}deg ${(i + 1) * 360 / n}deg`).join(', ')

  return (
    <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-lg dark:shadow-indigo-900/20 border border-indigo-50 dark:border-zinc-700/50 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
        
        {/* Left Side: Wheel */}
        <div className="flex-1 flex flex-col items-center relative">
          <h3 className="text-xl font-bold mb-6 text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Dices className="text-indigo-500" /> Decision Spinner
          </h3>
          
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Pointer (Top Center) */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-stone-800 dark:border-t-stone-200 z-20 drop-shadow-md"></div>
            
            {/* The Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: 'easeOut' }}
              className="w-full h-full rounded-full border-4 border-stone-800 shadow-2xl relative overflow-hidden"
              style={{ background: `conic-gradient(${gradientStr})` }}
            >
              {options.length > 0 && options.map((opt, i) => {
                const angle = (i * 360 / n) + (360 / n / 2)
                return (
                  <div 
                    key={opt.id}
                    className="absolute text-white font-bold text-sm md:text-base whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md z-10"
                    style={{ 
                      top: '50%', left: '50%', width: '45%', height: '30px', 
                      marginTop: '-15px', 
                      transformOrigin: 'left center',
                      transform: `rotate(${angle - 90}deg) translateX(10%)`,
                      textAlign: 'center'
                    }}
                  >
                    {opt.content}
                  </div>
                )
              })}
            </motion.div>
            
            {/* Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-stone-800 dark:bg-stone-200 rounded-full z-10 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 bg-white dark:bg-zinc-800 rounded-full"></div>
            </div>
          </div>

          <button
            onClick={spin}
            disabled={isSpinning || options.length < 2}
            className="mt-8 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-lg"
          >
            {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
          
          {/* Winner Announcement */}
          {winner && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl z-30 border-2 border-indigo-400 text-center min-w-[200px]"
            >
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">It landed on</p>
              <p className="text-xl font-extrabold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2">
                <Sparkles size={20} className="text-amber-500" /> {winner}
              </p>
            </motion.div>
          )}
        </div>

        {/* Right Side: Options List */}
        <div className="w-full lg:w-1/3 bg-stone-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-stone-100 dark:border-zinc-800 h-full max-h-[400px] flex flex-col">
          <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-4 flex justify-between items-center">
            Options ({options.length}/8)
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
            {options.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">Add options to spin.</p>
            ) : (
              options.map(opt => (
                <div key={opt.id} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-sm border border-stone-100 dark:border-zinc-700">
                  <span className="font-medium text-sm text-stone-700 dark:text-stone-200 truncate pr-2">{opt.content}</span>
                  <button 
                    onClick={() => handleDelete(opt.id)}
                    disabled={isSpinning || loading}
                    className="text-stone-400 hover:text-rose-500 transition-colors disabled:opacity-50 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <form ref={formRef} onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-stone-200 dark:border-zinc-700 mt-auto">
            <input
              type="text"
              name="content"
              required
              disabled={isSpinning || options.length >= 8 || loading}
              placeholder="e.g. Sushi 🍣"
              className="flex-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSpinning || options.length >= 8 || loading}
              className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 rounded-xl font-bold hover:bg-indigo-200 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
