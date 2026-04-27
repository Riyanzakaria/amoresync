'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PostIt } from '@/types/database'
import { deletePostIt, markPostItAsRead } from './actions'
import ConfirmModal from '@/components/ui/ConfirmModal'

const colors: Record<string, string> = {
  yellow: 'bg-yellow-100 text-stone-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100/90 dark:border-yellow-700/50',
  blue: 'bg-sky-100 text-stone-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-100/90 dark:border-sky-700/50',
  pink: 'bg-pink-100 text-stone-800 border-pink-200 dark:bg-pink-900/40 dark:text-pink-100/90 dark:border-pink-700/50',
  green: 'bg-emerald-100 text-stone-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100/90 dark:border-emerald-700/50',
}

export default function PostItCard({ postIt, currentUserId }: { postIt: PostIt, currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isMine = postIt.creator_id === currentUserId

  async function handleDelete() {
    setLoading(true)
    await deletePostIt(postIt.id)
  }

  async function handleMarkRead() {
    setLoading(true)
    await markPostItAsRead(postIt.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`p-6 rounded-3xl shadow-md border ${colors[postIt.color_theme || 'yellow'] || colors.yellow} relative overflow-hidden flex flex-col justify-between min-h-[160px] group transition-colors duration-300`}
    >
      <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 dark:bg-white/5 rounded-bl-3xl border-b border-l border-black/10 dark:border-white/10"></div>
      
      <p className="whitespace-pre-wrap font-bold leading-relaxed z-10">{postIt.content}</p>
      
      <div className="mt-4 flex justify-between items-end text-xs opacity-80 font-extrabold z-10 uppercase tracking-wider">
        <span>{isMine ? 'You' : 'Partner'}</span>
        <div className="flex items-center gap-3">
          {isMine ? (
            <button onClick={() => setShowDeleteModal(true)} disabled={loading} className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline">
              Delete
            </button>
          ) : (
            <button onClick={handleMarkRead} disabled={loading} className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 px-3 py-1.5 rounded-xl">
              Mark Read
            </button>
          )}
          <span>{new Date(postIt.created_at || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post-it?"
        description="Are you sure you want to rip this note? It will disappear from both of your boards."
        confirmText="Yes, delete it"
      />
    </motion.div>
  )
}
