'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

export default function Heartbeat({
  currentUserId,
  partnerId,
}: {
  currentUserId: string
  partnerId: string
}) {
  const [cooldown, setCooldown] = useState(false)
  const [hearts, setHearts] = useState<
    { id: number; x: number; size: number; delay: number; emoji: string }[]
  >([])
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  const roomName = `couple_${[currentUserId, partnerId].sort().join('_')}`

  const triggerHearts = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    const emojis = ['🩷', '💖', '💝', '💗', '💓', '💕']
    const newHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 150,
      size: Math.random() * 20 + 24,
      delay: Math.random() * 0.3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }))

    setHearts((prev) => [...prev, ...newHearts])
    setTimeout(() => {
      setHearts((prev) =>
        prev.filter((h) => !newHearts.find((nh) => nh.id === h.id))
      )
    }, 4000)
  }, [])

  useEffect(() => {
    if (!partnerId) return
    const channel = supabase.channel(roomName, {
      config: { broadcast: { ack: false } },
    })

    channel
      .on('broadcast', { event: 'heartbeat_sent' }, (payload) => {
        if (payload.payload?.sender_id !== currentUserId) {
          triggerHearts()
        }
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, partnerId, roomName, supabase, triggerHearts])

  const sendHeartbeat = async () => {
    if (cooldown || !partnerId || !channelRef.current) return
    setCooldown(true)
    triggerHearts()
    await channelRef.current.send({
      type: 'broadcast',
      event: 'heartbeat_sent',
      payload: { sender_id: currentUserId },
    })

    // Fire-and-forget push notification (for when partner is offline)
    fetch('/api/push/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId }),
    }).catch(() => {})

    setTimeout(() => setCooldown(false), 3000)
  }

  if (!partnerId) return null

  return (
    <>
      {/* ── Heartbeat Button ─────────────────────────────────────── */}
      <motion.button
        onClick={sendHeartbeat}
        disabled={cooldown}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: cooldown ? 1 : 1.12 }}
        transition={springConfig}
        title="Send love 💕"
        className="fixed bottom-[88px] lg:bottom-8 right-4 lg:right-8 z-40 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: cooldown
            ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
            : 'linear-gradient(135deg, #ff8fab 0%, #f43f5e 100%)',
          boxShadow: cooldown
            ? 'none'
            : '0 8px 32px rgba(244,63,94,0.45), 0 0 0 8px rgba(244,63,94,0.1)',
        }}
      >
        <span
          className="text-2xl select-none"
          style={{
            filter: cooldown ? 'grayscale(0.5)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            animation: cooldown ? 'none' : 'pulse-soft 1.8s ease-in-out infinite',
          }}
        >
          {cooldown ? '💤' : '💗'}
        </span>
      </motion.button>

      {/* ── Floating Hearts ───────────────────────────────────────── */}
      <div className="fixed bottom-[160px] lg:bottom-28 right-10 lg:right-14 z-30 pointer-events-none">
        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 0, y: 0, scale: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: -(300 + Math.random() * 200),
                scale: [0.5, 1.2, 1],
                x: heart.x,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: heart.delay,
                ease: 'easeOut',
              }}
              className="absolute bottom-0 drop-shadow-md"
              style={{ fontSize: heart.size, marginLeft: '-1rem' }}
            >
              {heart.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
