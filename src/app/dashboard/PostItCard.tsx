'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PostIt } from '@/types/database'
import { deletePostIt, markPostItAsRead } from './actions'
import ConfirmModal from '@/components/ui/ConfirmModal'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

// Bubbly Soft-UI card color themes
const colorThemes: Record<
  string,
  { bg: string; border: string; text: string; badge: string; badgeText: string }
> = {
  yellow: {
    bg: 'linear-gradient(140deg, #FFFDE7 0%, #FEF9C3 100%)',
    border: 'rgba(253,224,71,0.4)',
    text: '#78600A',
    badge: '#FDE047',
    badgeText: '#78600A',
  },
  pink: {
    bg: 'linear-gradient(140deg, #FFF0F3 0%, #FFE4E6 100%)',
    border: 'rgba(251,113,133,0.3)',
    text: '#9F1239',
    badge: '#FB7185',
    badgeText: '#fff',
  },
  blue: {
    bg: 'linear-gradient(140deg, #F0F9FF 0%, #E0F2FE 100%)',
    border: 'rgba(56,189,248,0.3)',
    text: '#0C4A6E',
    badge: '#38BDF8',
    badgeText: '#fff',
  },
  green: {
    bg: 'linear-gradient(140deg, #F0FDF4 0%, #D1FAE5 100%)',
    border: 'rgba(52,211,153,0.35)',
    text: '#065F46',
    badge: '#34D399',
    badgeText: '#fff',
  },
}

export default function PostItCard({
  postIt,
  currentUserId,
}: {
  postIt: PostIt
  currentUserId: string
}) {
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isMine = postIt.creator_id === currentUserId
  const theme = colorThemes[postIt.color_theme || 'yellow'] || colorThemes.yellow

  async function handleDelete() {
    setLoading(true)
    await deletePostIt(postIt.id)
  }

  async function handleMarkRead() {
    setLoading(true)
    await markPostItAsRead(postIt.id)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.85, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18 } }}
        transition={springConfig}
        whileHover={{ y: -4, transition: springConfig }}
        className="relative flex flex-col justify-between min-h-[160px] p-5 rounded-[2rem] overflow-hidden group"
        style={{
          background: theme.bg,
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.06), 0 2px 8px ${theme.border}`,
          color: theme.text,
        }}
      >
        {/* Corner fold decoration */}
        <div
          className="absolute top-0 right-0 w-8 h-8 rounded-bl-[1.5rem]"
          style={{
            background: `rgba(255,255,255,0.5)`,
            borderLeft: `1px solid ${theme.border}`,
            borderBottom: `1px solid ${theme.border}`,
          }}
        />

        {/* Message content */}
        <p className="whitespace-pre-wrap font-semibold leading-relaxed text-sm flex-1 z-10">
          {postIt.content}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between z-10">
          {/* Author badge */}
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: theme.badge, color: theme.badgeText }}
          >
            {isMine ? '✍️ You' : '💌 Partner'}
          </span>

          {/* Actions + time */}
          <div className="flex items-center gap-2 text-xs font-bold">
            {isMine ? (
              <motion.button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                whileTap={{ scale: 0.9 }}
                transition={springConfig}
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full px-2.5 py-1 bg-white/60 hover:bg-rose-50 text-rose-400 hover:text-rose-600"
              >
                🗑 Delete
              </motion.button>
            ) : (
              <motion.button
                onClick={handleMarkRead}
                disabled={loading}
                whileTap={{ scale: 0.9 }}
                transition={springConfig}
                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full px-2.5 py-1 bg-white/60 hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700"
              >
                ✓ Read
              </motion.button>
            )}
            <span className="opacity-60">
              {new Date(postIt.created_at || '').toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Post-it? 🗑️"
        description="Are you sure you want to rip this note? It will disappear from both of your boards."
        confirmText="Yes, delete it"
      />
    </>
  )
}
