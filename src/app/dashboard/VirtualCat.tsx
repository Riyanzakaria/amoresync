'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { feedPet } from './PetActions'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Single beautiful Lottie cat animation — manipulated via CSS + Framer Motion
const LOTTIE_URL = 'https://lottie.host/9082eef0-ed1c-42c4-9c1b-167f0ac3c278/2pe9rPeQTu.lottie'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

type PetRecord = Record<string, unknown> & {
  id: string
  pet_name: string
  happiness_level: number
  last_interacted_at: string
}

export default function VirtualCat({
  initialPet,
}: {
  initialPet: PetRecord | null
}) {
  const [pet, setPet] = useState(initialPet)
  const [isFeeding, setIsFeeding] = useState(false)
  const [foodEmoji, setFoodEmoji] = useState('🐟')
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const supabase = createClient()

  const calculateEffectiveHappiness = (dbPet: PetRecord | null) => {
    if (!dbPet) return 50
    const hoursSince =
      (Date.now() - new Date(dbPet.last_interacted_at).getTime()) /
      (1000 * 60 * 60)
    return Math.max(0, dbPet.happiness_level - Math.floor(hoursSince / 24) * 10)
  }

  const [displayHappiness, setDisplayHappiness] = useState(
    calculateEffectiveHappiness(initialPet)
  )

  useEffect(() => {
    if (!pet) return
    const current = calculateEffectiveHappiness(pet)
    setDisplayHappiness(current)
    if (current === 100) {
      const interval = setInterval(() => {
        setHearts((prev) =>
          [...prev, { id: Date.now(), x: Math.random() * 40 - 20 }].slice(-5)
        )
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [pet])

  useEffect(() => {
    if (!pet) return
    const channel = supabase
      .channel('public:virtual_pets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'virtual_pets',
          filter: `id=eq.${pet.id}`,
        },
        (payload) => {
          const newData = payload.new as PetRecord
          if (calculateEffectiveHappiness(newData) > displayHappiness) {
            triggerFeedAnimation()
          }
          setPet(newData)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
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
      setPet({
        ...pet,
        happiness_level: res.happiness,
        last_interacted_at: new Date().toISOString(),
      } as PetRecord)
      if (res.message.includes('Total')) {
        setFeedback('✨ Combo +50!')
        setTimeout(() => setFeedback(null), 3000)
      } else {
        setFeedback('+20 💕')
        setTimeout(() => setFeedback(null), 2000)
      }
    }
  }

  if (!pet) return null

  const isSad = displayHappiness < 30
  const isMax = displayHappiness >= 100

  // Bar gradient based on state
  const barGradient = isSad
    ? 'linear-gradient(90deg, #b0b0b0 0%, #d0d0d0 100%)'
    : isMax
    ? 'linear-gradient(90deg, #ff8fab 0%, #f43f5e 100%)'
    : 'linear-gradient(90deg, #C8F0E0 0%, #4ade80 100%)'

  const catVariants = {
    idle:    { scale: 1, transition: { duration: 2 } },
    sad:     { x: [-2, 2, -2, 2, 0], scale: 0.95, transition: { duration: 0.5, repeat: Infinity } },
    feeding: { y: [0, -15, 0, -10, 0], scale: 1.1, transition: { duration: 0.8 } },
    happy:   { y: [0, -5, 0], scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: 0.1 }}
      className="bubbly-card p-6 flex flex-col items-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #fff 0%, #fdf0f5 100%)',
      }}
    >
      {/* Decorative soft blob inside card */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FFD1DC, transparent)' }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 self-start">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: '#FFD1DC' }}
        >
          🐾
        </div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {pet.pet_name}
        </h3>
      </div>

      {/* Happiness Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
          <span>Happiness</span>
          <span
            className="font-bold"
            style={{ color: isSad ? '#9ca3af' : isMax ? '#f43f5e' : '#4ade80' }}
          >
            {displayHappiness}/100
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,182,193,0.2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: barGradient }}
            initial={{ width: `${displayHappiness}%` }}
            animate={{ width: `${displayHappiness}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {/* State emoji badges */}
        <div className="flex gap-2 mt-2">
          {isSad && (
            <span className="badge-pastel bg-stone-100 text-stone-500">😿 Hungry</span>
          )}
          {isMax && (
            <span className="badge-pastel bg-rose-50 text-rose-500">💖 Full & Happy</span>
          )}
          {!isSad && !isMax && (
            <span className="badge-pastel bg-mint text-emerald-700">😸 Content</span>
          )}
        </div>
      </div>

      {/* The Cat Container */}
      <div className="relative w-36 h-36 flex items-end justify-center mb-6">
        {/* Heart particles */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, x: h.x, scale: 0.5 }}
              animate={{ opacity: 0, y: -60, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute text-xl pointer-events-none"
            >
              💖
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Food icon on feed */}
        <AnimatePresence>
          {isFeeding && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 40 }}
              animate={{ opacity: 1, scale: 1.5, y: -40 }}
              exit={{ opacity: 0, scale: 0, y: -60 }}
              className="absolute z-10 text-2xl"
            >
              {foodEmoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score popup */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -32, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springConfig}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm font-extrabold whitespace-nowrap z-20 rounded-full px-3 py-1"
              style={{
                background: 'linear-gradient(135deg, #FFD1DC, #f9a8c0)',
                color: '#c0396b',
                boxShadow: '0 4px 16px rgba(255,182,193,0.5)',
              }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Cat - Lottie + Framer Motion manipulation */}
        <motion.div
          variants={catVariants}
          animate={
            isFeeding ? 'feeding' : isMax ? 'happy' : isSad ? 'sad' : 'idle'
          }
          onClick={handleFeed}
          whileTap={{ scale: 0.9 }}
          transition={springConfig}
          className={`z-10 cursor-pointer select-none w-full h-full
            ${isSad && !isFeeding ? 'grayscale brightness-75 sepia-[.3]' : ''}
            ${isMax ? 'saturate-150 brightness-110' : ''}
          `}
          style={
            isMax
              ? { filter: 'drop-shadow(0 0 18px rgba(244,63,94,0.4))' }
              : undefined
          }
          title={isSad ? "I'm hungry..." : 'Purrrr...'}
        >
          <DotLottieReact src={LOTTIE_URL} loop autoplay />
        </motion.div>
      </div>

      {/* Feed Button */}
      <motion.button
        onClick={handleFeed}
        disabled={isMax}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        transition={springConfig}
        className="btn-bubbly-primary w-full max-w-[200px] text-sm"
      >
        {isMax ? '🌟 Full & Happy!' : '🐟 Feed Mochi'}
      </motion.button>

      {/* Combo hint */}
      <div
        className="mt-5 pt-4 w-full text-center text-xs font-semibold leading-relaxed"
        style={{
          borderTop: '1px dashed rgba(255,182,193,0.4)',
          color: 'var(--text-muted)',
        }}
      >
        Feed together on the same day for a{' '}
        <strong style={{ color: '#f43f5e' }}>+50 Combo Bonus!</strong>
        <br />
        Gains passive happiness when you leave notes. 🌸
      </div>
    </motion.div>
  )
}
