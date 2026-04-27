'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Heart } from 'lucide-react'

export default function Heartbeat({ currentUserId, partnerId }: { currentUserId: string, partnerId: string }) {
  const [cooldown, setCooldown] = useState(false)
  const [hearts, setHearts] = useState<{id: number, x: number, size: number, delay: number, emoji: string}[]>([])
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  // Generate a unique room name for the couple
  const roomName = `couple_${[currentUserId, partnerId].sort().join('_')}`

  const triggerHearts = useCallback(() => {
    // 1. Haptic Feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }

    // 2. Visual Animation Hearts
    const emojis = ['🩷', '💖', '💝', '💗', '💓', '💕']
    const newHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 150, // spread horizontally 
      size: Math.random() * 20 + 24, // sizes between 24px and 44px
      delay: Math.random() * 0.3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }))

    setHearts(prev => [...prev, ...newHearts])

    // Cleanup hearts after animation finishes (about 3.5 seconds)
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)))
    }, 4000)
  }, [])

  useEffect(() => {
    if (!partnerId) return

    const channel = supabase.channel(roomName, {
      config: { broadcast: { ack: false } },
    })
    
    channel.on('broadcast', { event: 'heartbeat_sent' }, (payload) => {
      const data = payload.payload
      if (data?.sender_id !== currentUserId) {
        triggerHearts()
      }
    }).subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, partnerId, roomName, supabase, triggerHearts])

  const sendHeartbeat = async () => {
    if (cooldown || !partnerId || !channelRef.current) return
    
    setCooldown(true)
    
    // Trigger optimistic UI for sender
    triggerHearts()

    // Broadcast event
    await channelRef.current.send({
      type: 'broadcast',
      event: 'heartbeat_sent',
      payload: { sender_id: currentUserId }
    })

    // Anti-spam cooldown
    setTimeout(() => {
      setCooldown(false)
    }, 3000)
  }

  if (!partnerId) return null

  return (
    <>
      <button
        onClick={sendHeartbeat}
        disabled={cooldown}
        className={`fixed bottom-[100px] lg:bottom-8 right-4 lg:right-8 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          cooldown 
            ? 'bg-stone-300 dark:bg-zinc-700 text-stone-500 cursor-not-allowed scale-95' 
            : 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 hover:scale-110 shadow-rose-300 dark:shadow-rose-900/50 animate-[pulse_2s_ease-in-out_infinite]'
        }`}
        title="Thinking of you..."
      >
        <Heart className={`w-8 h-8 ${cooldown ? 'opacity-50' : 'text-white fill-white'}`} />
      </button>

      {/* Floating Hearts Container */}
      <div className="fixed bottom-[160px] lg:bottom-24 right-12 lg:right-16 z-30 pointer-events-none">
        <AnimatePresence>
          {hearts.map(heart => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 0, y: 0, scale: 0, x: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -300 - Math.random() * 200, // Float up by 300-500px
                scale: [0.5, 1.2, 1],
                x: heart.x 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2.5 + Math.random(), 
                delay: heart.delay,
                ease: "easeOut"
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
