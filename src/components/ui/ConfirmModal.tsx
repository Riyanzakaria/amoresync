'use client'

import { motion, AnimatePresence } from 'framer-motion'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

type ConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = true,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
            style={{ background: 'rgba(30,10,40,0.35)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 24 }}
            transition={springConfig}
            className="relative w-full max-w-sm bubbly-card p-8 overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdf4f8 100%)' }}
          >
            {/* Soft glow blob */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: isDangerous
                  ? 'radial-gradient(circle, rgba(255,182,193,0.4), transparent)'
                  : 'radial-gradient(circle, rgba(200,240,224,0.5), transparent)',
              }}
            />

            <div className="relative z-10 flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl"
                style={{
                  background: isDangerous
                    ? 'linear-gradient(135deg, #FFD1DC, #FFE4E6)'
                    : 'linear-gradient(135deg, #C8F0E0, #D1FAE5)',
                  boxShadow: isDangerous
                    ? '0 8px 24px rgba(255,182,193,0.4)'
                    : '0 8px 24px rgba(200,240,224,0.4)',
                }}
              >
                {isDangerous ? '🗑️' : '✅'}
              </div>

              <div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                {description && (
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {description}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="w-full flex gap-3 mt-2">
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.93 }}
                  transition={springConfig}
                  className="flex-1 py-3 rounded-full font-bold text-sm transition-all"
                  style={{
                    background: 'rgba(255,182,193,0.15)',
                    color: 'var(--text-muted)',
                    border: '1.5px solid rgba(255,182,193,0.3)',
                  }}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.03 }}
                  transition={springConfig}
                  className="flex-1 py-3 rounded-full font-bold text-sm text-white"
                  style={{
                    background: isDangerous
                      ? 'linear-gradient(135deg, #ff8fab, #f43f5e)'
                      : 'linear-gradient(135deg, #6EE7B7, #34D399)',
                    boxShadow: isDangerous
                      ? '0 6px 20px rgba(244,63,94,0.35)'
                      : '0 6px 20px rgba(52,211,153,0.35)',
                  }}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
