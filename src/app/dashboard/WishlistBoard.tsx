'use client'

import { useState } from 'react'
import { depositSavings, deleteWishlist } from './WishlistActions'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'

export type WishlistWithBalance = {
  id: string
  title: string
  target_amount: number
  category: string
  total_saved: number
}

export default function WishlistBoard({ wishlists }: { wishlists: WishlistWithBalance[] }) {
  if (!wishlists || wishlists.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 text-center transition-colors duration-300">
        <p className="text-stone-500 dark:text-stone-400 font-medium">You both haven't set a wishlist goal yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {wishlists.map(w => <WishlistCard key={w.id} wishlist={w} />)}
    </div>
  )
}

function WishlistCard({ wishlist }: { wishlist: WishlistWithBalance }) {
  const [showDeposit, setShowDeposit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const percentage = Math.min(100, Math.round((wishlist.total_saved / wishlist.target_amount) * 100))
  const isComplete = percentage >= 100

  async function executeDelete() {
    setIsDeleting(true)
    const res = await deleteWishlist(wishlist.id)
    if (res?.error) setError(res.error)
    setIsDeleting(false)
  }

  async function handleDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('wishlist_id', wishlist.id)
    const res = await depositSavings(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      setShowDeposit(false)
    }
    setLoading(false)
  }

  const categoryIcons: Record<string, string> = {
    travel: '✈️',
    date_night: '🍷',
    home: '🏡',
    gift: '🎁',
    other: '✨'
  }

  return (
    <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-emerald-100/30 dark:shadow-lg dark:shadow-emerald-900/10 border border-emerald-50 dark:border-zinc-700/50 transition-colors duration-300 relative overflow-hidden group">
      
      {isComplete && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-xl z-10 shadow-sm">
          Goal Reached!
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="pr-12">
          <h4 className="text-lg font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <span>{categoryIcons[wishlist.category] || '✨'}</span> {wishlist.title}
          </h4>
          <p className="text-sm font-bold text-stone-500 dark:text-stone-400 mt-1">
            <span className="text-emerald-600 dark:text-emerald-400">Rp{wishlist.total_saved.toLocaleString('id-ID')}</span> / Rp{wishlist.target_amount.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2 items-start">
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="text-xs font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-800/50 transition-colors border border-rose-100 dark:border-transparent disabled:opacity-50"
            title="Delete Goal"
          >
            <Trash2 size={16} />
          </button>
          {!isComplete && (
            <button 
              onClick={() => setShowDeposit(!showDeposit)}
              className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-2.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors border border-emerald-100 dark:border-transparent"
            >
              {showDeposit ? 'Cancel' : '+ Deposit'}
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-stone-100 dark:bg-zinc-900/50 rounded-full h-3.5 mb-2 overflow-hidden border border-stone-200 dark:border-zinc-800">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-rose-400 dark:bg-rose-500'}`}
        />
      </div>
      <p className="text-[11px] font-bold text-stone-400 dark:text-stone-500 text-right uppercase tracking-widest">
        {percentage}% Funded
      </p>

      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4 pt-4 border-t border-stone-100 dark:border-zinc-700/50"
          >
            <form onSubmit={handleDeposit} className="flex flex-col gap-3">
              {error && <div className="text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 py-2 px-3 rounded-xl">{error}</div>}
              <div className="flex gap-3">
                <input
                  name="amount"
                  type="number"
                  min="1"
                  required
                  placeholder="Amount (Rp)"
                  className="w-1/3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-2.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 font-medium text-sm placeholder-stone-400 dark:placeholder-zinc-500"
                />
                <input
                  name="note"
                  type="text"
                  placeholder="Note (e.g. Ice cream money)"
                  className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-2.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 font-medium text-sm placeholder-stone-400 dark:placeholder-zinc-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
                >
                  {loading ? '...' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        title="Delete Wishlist?"
        description="Are you sure you want to delete this savings goal? All its deposit history will also be permanently deleted."
        confirmText="Yes, delete it"
      />
    </div>
  )
}
