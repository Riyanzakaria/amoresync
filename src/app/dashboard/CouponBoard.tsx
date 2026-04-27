'use client'

import { useState, useRef } from 'react'
import { createCoupon, updateCouponStatus, deleteCoupon } from './CouponActions'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Gift, CheckCircle, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ScratchOff from '@/components/ui/ScratchOff'

export type Coupon = {
  id: string
  title: string
  sender_id: string
  receiver_id: string
  status: 'available' | 'claimed' | 'used'
  created_at: string
}

export default function CouponBoard({ coupons, currentUserId, partnerId }: { coupons: Coupon[], currentUserId: string, partnerId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.append('receiver_id', partnerId)
    const res = await createCoupon(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      formRef.current?.reset()
    }
    setLoading(false)
  }

  const availableCoupons = coupons.filter(c => c.status === 'available')
  const claimedCoupons = coupons.filter(c => c.status === 'claimed')
  const usedCoupons = coupons.filter(c => c.status === 'used')

  return (
    <div className="space-y-6">
      {/* Create Coupon Form */}
      <form ref={formRef} onSubmit={handleCreate} className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-amber-100/50 dark:shadow-lg dark:shadow-amber-900/20 border border-amber-50 dark:border-zinc-700/50 transition-colors duration-300">
        <h3 className="text-lg font-bold mb-4 text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <Ticket className="text-amber-500" /> Gift a Coupon
        </h3>
        <div className="space-y-4">
          {error && (
            <div className="text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 py-2 px-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              name="title"
              required
              type="text"
              placeholder="e.g. Free 15-Min Massage 💆‍♂️"
              className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-3.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent font-medium text-sm transition-all placeholder-stone-400 dark:placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={loading || !partnerId}
              className="w-full sm:w-1/3 py-3.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-md shadow-amber-200/50 dark:shadow-amber-900/50 whitespace-nowrap"
            >
              {loading ? 'Sending...' : 'Give Ticket'}
            </button>
          </div>
        </div>
      </form>

      {/* Coupon Lists */}
      {coupons.length === 0 ? (
        <div className="text-center py-8 text-stone-500 dark:text-stone-400 font-medium">
          No coupons yet. Be the first to send a gift! 🎁
        </div>
      ) : (
        <div className="space-y-8">
          {availableCoupons.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Gift size={16} /> Available to Claim
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {availableCoupons.map(c => <CouponCard key={c.id} coupon={c} currentUserId={currentUserId} />)}
                </AnimatePresence>
              </div>
            </div>
          )}

          {claimedCoupons.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle size={16} /> Ready to Use
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {claimedCoupons.map(c => <CouponCard key={c.id} coupon={c} currentUserId={currentUserId} />)}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {usedCoupons.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest mb-4">
                Past Memories
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <AnimatePresence>
                  {usedCoupons.map(c => <CouponCard key={c.id} coupon={c} currentUserId={currentUserId} />)}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CouponCard({ coupon, currentUserId }: { coupon: Coupon, currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isSender = currentUserId === coupon.sender_id
  const isReceiver = currentUserId === coupon.receiver_id

  async function handleStatusChange(status: 'claimed' | 'used') {
    setLoading(true)
    await updateCouponStatus(coupon.id, status)
    setLoading(false)
  }

  async function executeDelete() {
    setLoading(true)
    const res = await deleteCoupon(coupon.id)
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  // Visual styles depending on status
  const bgColors = {
    available: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700/50',
    claimed: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700/50',
    used: 'bg-stone-50 dark:bg-zinc-800/50 border-stone-200 dark:border-zinc-700',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative p-5 rounded-2xl border-2 border-dashed shadow-sm transition-all duration-300 ${bgColors[coupon.status]}`}
    >
      {/* Ticket perforations */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#faf8f5] dark:bg-zinc-900 rounded-full border-r-2 border-dashed border-stone-200 dark:border-zinc-700/50" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#faf8f5] dark:bg-zinc-900 rounded-full border-l-2 border-dashed border-stone-200 dark:border-zinc-700/50" />

      <div className="flex justify-between items-center gap-4">
        <div className="pl-2 flex-1 pr-4">
          <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">
            {isSender ? 'You gifted' : 'You received'}
          </p>
          
          {isReceiver && coupon.status === 'available' ? (
            <div className="mt-2 w-full max-w-[200px]">
              <ScratchOff 
                isCompleted={false} 
                onComplete={() => handleStatusChange('claimed')}
              >
                <h4 className="text-base font-extrabold text-stone-800 dark:text-stone-100 leading-tight">
                  {coupon.title}
                </h4>
              </ScratchOff>
            </div>
          ) : (
            <h4 className="text-base font-extrabold text-stone-800 dark:text-stone-100 leading-tight">
              {coupon.title}
            </h4>
          )}
        </div>
        
        <div className="flex flex-col gap-2 shrink-0 pr-2">

          {coupon.status === 'claimed' && (
            <button 
              disabled={loading}
              onClick={() => handleStatusChange('used')}
              className="text-xs font-bold bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Use Now'}
            </button>
          )}

          {isSender && (
            <button 
              disabled={loading}
              onClick={() => setShowDeleteModal(true)}
              className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={14} className="mx-auto" />
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        title="Delete Coupon?"
        description="Are you sure you want to delete this coupon? It will be removed permanently."
        confirmText="Yes, delete it"
      />
    </motion.div>
  )
}
