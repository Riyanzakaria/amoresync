'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PostIt } from '@/types/database'
import { AnimatePresence } from 'framer-motion'
import PostItCard from './PostItCard'

export default function PostItBoard({ initialPostIts, currentUserId }: { initialPostIts: PostIt[], currentUserId: string }) {
  const [postIts, setPostIts] = useState<PostIt[]>(initialPostIts)
  const supabase = createClient()

  useEffect(() => {
    setPostIts(initialPostIts)
  }, [initialPostIts])

  useEffect(() => {
    const channel = supabase
      .channel('public:post_its')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_its' },
        (payload) => {
          const newPostIt = payload.new as PostIt
          setPostIts((current) => {
            if (current.find(p => p.id === newPostIt.id)) return current;
            return [newPostIt, ...current]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'post_its' },
        (payload) => {
          const updatedPostIt = payload.new as PostIt
          setPostIts((current) =>
            current.map((p) => (p.id === updatedPostIt.id ? updatedPostIt : p))
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_its' },
        (payload) => {
          setPostIts((current) => current.filter((p) => p.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const unreadPostIts = postIts.filter(p => !p.is_read)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <AnimatePresence>
        {unreadPostIts.map((postIt) => (
          <PostItCard key={postIt.id} postIt={postIt} currentUserId={currentUserId} />
        ))}
      </AnimatePresence>
      {unreadPostIts.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12 font-medium">
          No post-its yet. Be the first to leave a message!
        </div>
      )}
    </div>
  )
}
