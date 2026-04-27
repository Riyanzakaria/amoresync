'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PostIt } from '@/types/database'
import { AnimatePresence, motion } from 'framer-motion'
import PostItCard from './PostItCard'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

export default function PostItBoard({
  initialPostIts,
  currentUserId,
}: {
  initialPostIts: PostIt[]
  currentUserId: string
}) {
  const [postIts, setPostIts] = useState<PostIt[]>(initialPostIts)
  const supabase = createClient()

  useEffect(() => {
    setPostIts(initialPostIts)
  }, [initialPostIts])

  useEffect(() => {
    const channel = supabase
      .channel('public:post_its')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_its' }, (payload) => {
        const newPostIt = payload.new as PostIt
        setPostIts((current) => {
          if (current.find((p) => p.id === newPostIt.id)) return current
          return [newPostIt, ...current]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'post_its' }, (payload) => {
        const updated = payload.new as PostIt
        setPostIts((current) => current.map((p) => (p.id === updated.id ? updated : p)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_its' }, (payload) => {
        setPostIts((current) => current.filter((p) => p.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const unread = postIts.filter((p) => !p.is_read)

  return (
    <div className="p-5">
      {unread.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springConfig}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div
            className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mb-4 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #FFD1DC, #E8D5F5)',
              boxShadow: '0 8px 24px rgba(255,182,193,0.35)',
            }}
          >
            💌
          </div>
          <p className="font-bold text-base" style={{ color: 'var(--text-muted)' }}>
            No notes yet
          </p>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Be the first to leave a sweet message!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {unread.map((postIt) => (
              <PostItCard key={postIt.id} postIt={postIt} currentUserId={currentUserId} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
