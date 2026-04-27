'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { feedPet } from './PetActions'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Karena sulit mencari 4 animasi Lottie kucing dengan art style yang sama persis,
// kita akan menggunakan TEKNIK MANIPULASI (1 Lottie Animasi Idle) + Framer Motion + CSS Filters.
// Cari 1 saja animasi kucing yang paling bagus (idle/diam) di LottieFiles!
const LOTTIE_URL = 'https://lottie.host/9082eef0-ed1c-42c4-9c1b-167f0ac3c278/2pe9rPeQTu.lottie' // Ganti URL ini

export default function VirtualCat({ initialPet, currentUserId }: { initialPet: any, currentUserId: string }) {
  const [pet, setPet] = useState(initialPet)
  const [isFeeding, setIsFeeding] = useState(false)
  const [foodEmoji, setFoodEmoji] = useState('🐟')
  const [hearts, setHearts] = useState<{ id: number, x: number }[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const supabase = createClient()

  // Calculate actual happiness immediately based on decay
  const calculateEffectiveHappiness = (dbPet: any) => {
    if (!dbPet) return 50
    const hoursSinceLastInteract = (new Date().getTime() - new Date(dbPet.last_interacted_at).getTime()) / (1000 * 60 * 60)
    const decayPoints = Math.floor(hoursSinceLastInteract / 24) * 10
    return Math.max(0, dbPet.happiness_level - decayPoints)
  }

  const [displayHappiness, setDisplayHappiness] = useState(calculateEffectiveHappiness(initialPet))

  useEffect(() => {
    if (!pet) return
    const current = calculateEffectiveHappiness(pet)
    setDisplayHappiness(current)
    
    // Heart particles if 100
    if (current === 100) {
      const interval = setInterval(() => {
        setHearts(prev => [...prev, { id: Date.now(), x: Math.random() * 40 - 20 }].slice(-5))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [pet])

  useEffect(() => {
    if (!pet) return
    const channel = supabase
      .channel('public:virtual_pets')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'virtual_pets', filter: `id=eq.${pet.id}` }, (payload) => {
        const newData = payload.new
        
        // Check if happiness went up significantly (someone fed it)
        const newHappiness = calculateEffectiveHappiness(newData)
        if (newHappiness > displayHappiness) {
           triggerFeedAnimation()
        }
        setPet(newData)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [pet, supabase, displayHappiness])

  const triggerFeedAnimation = () => {
    setFoodEmoji(Math.random() > 0.5 ? '🐟' : '🥛')
    setIsFeeding(true)
    setTimeout(() => setIsFeeding(false), 2000)
  }

  const handleFeed = async () => {
    if (displayHappiness >= 100) return
    triggerFeedAnimation()
    const res = await feedPet()
    
    if (res?.success) {
      setPet({ ...pet, happiness_level: res.happiness, last_interacted_at: new Date().toISOString() })
      if (res.message.includes('Total')) {
        setFeedback('Combo Bonus! +50')
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback('+20')
        setTimeout(() => setFeedback(null), 2000)
      }
    }
  }

  if (!pet) return null

  // Determine State
  const isSad = displayHappiness < 30
  const isMax = displayHappiness >= 100

  const catVariants = {
    idle: {
      scale: 1,
      transition: { duration: 2 }
    },
    sad: {
      x: [-2, 2, -2, 2, 0],
      scale: 0.95,
      transition: { duration: 0.5, repeat: Infinity } // Shivering effect
    },
    feeding: {
      y: [0, -15, 0, -10, 0],
      scale: 1.1,
      transition: { duration: 0.8 } // Bouncing up to eat
    },
    happy: {
      y: [0, -5, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, repeat: Infinity } // Light bouncing/dancing
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 flex flex-col items-center relative overflow-hidden lg:h-full">
      <h3 className="text-xl font-black text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
        <span>🐾</span> {pet.pet_name}
      </h3>
      
      {/* Happiness Bar */}
      <div className="w-full max-w-[200px] h-3 bg-stone-100 dark:bg-zinc-900 rounded-full mb-8 relative overflow-visible">
        <motion.div 
          className={`h-full rounded-full ${isSad ? 'bg-stone-400' : isMax ? 'bg-rose-500' : 'bg-emerald-400'}`}
          initial={{ width: `${displayHappiness}%` }}
          animate={{ width: `${displayHappiness}%` }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-stone-400">Happiness: {displayHappiness}/100</div>
      </div>

      {/* The Cat Container */}
      <div className="relative w-32 h-32 flex items-end justify-center mb-6">
        {/* Particles */}
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, x: h.x, scale: 0.5 }}
              animate={{ opacity: 0, y: -60, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute text-xl pointer-events-none"
              style={{ zIndex: 0 }}
            >
              💖
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Feeding Icon */}
        <AnimatePresence>
          {isFeeding && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 40, y: 0 }}
              animate={{ opacity: 1, scale: 1.5, y: -40 }}
              exit={{ opacity: 0, scale: 0, y: -60 }}
              className="absolute z-10"
            >
              {foodEmoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Text */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -30 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute -top-8 text-rose-500 font-extrabold text-sm whitespace-nowrap z-20 bg-white/90 dark:bg-zinc-800/90 px-3 py-1 rounded-full shadow-sm"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cat Lottie Player - Single Source with Manipulations */}
        <motion.div
          variants={catVariants}
          animate={isFeeding ? "feeding" : isMax ? "happy" : isSad ? "sad" : "idle"}
          className={`z-10 cursor-pointer drop-shadow-xl select-none w-full h-full transition-all duration-700 
            ${isSad && !isFeeding ? 'grayscale brightness-75 sepia-[.3]' : ''} 
            ${isMax ? 'saturate-150 brightness-110 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : ''}`}
          onClick={handleFeed}
          title={isSad ? "I'm hungry..." : "Purrrr..."}
        >
          <DotLottieReact
            src={LOTTIE_URL}
            loop={true}
            autoplay
          />
        </motion.div>
      </div>

      <button 
        onClick={handleFeed}
        disabled={isMax}
        className="px-8 py-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm disabled:opacity-50 border border-rose-200 dark:border-rose-900 active:scale-95 uppercase tracking-widest"
      >
        {isMax ? 'Full & Happy!' : 'Feed Mochi'}
      </button>

      {/* Double Feed Hint */}
      <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-700 w-full">
        <p className="text-xs text-stone-400 dark:text-stone-500 text-center leading-relaxed font-medium">
          Feed together on the same day for a <strong className="text-rose-400">+50 Combo Bonus!</strong><br/>
          Gains passive happiness when you leave notes or save money.
        </p>
      </div>
    </div>
  )
}
