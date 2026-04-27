'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

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
  isDangerous = true 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-2xl border border-rose-50 dark:border-zinc-700/50 overflow-hidden"
          >
            {/* Soft background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-100/50 dark:bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDangerous ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500'}`}>
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 mb-2">{title}</h3>
              {description && (
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-8">{description}</p>
              )}
              
              <div className="w-full flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-stone-700 dark:text-stone-300 rounded-2xl font-bold transition-colors text-sm"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 py-3.5 px-4 text-white rounded-2xl font-bold transition-colors text-sm shadow-md ${
                    isDangerous 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none' 
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
