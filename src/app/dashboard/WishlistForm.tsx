'use client'

import { useRef, useState } from 'react'
import { createWishlist } from './WishlistActions'

export default function WishlistForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const res = await createWishlist(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      formRef.current?.reset()
    }
    setLoading(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 transition-colors duration-300">
      <h3 className="text-lg font-bold mb-4 text-stone-800 dark:text-stone-100 flex items-center gap-2">
        <span>💰</span> Start a Savings Goal
      </h3>
      <div className="space-y-4">
        {error && (
          <div className="text-rose-600 dark:text-rose-400 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 py-2 px-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
            {error}
          </div>
        )}
        <input
          name="title"
          required
          type="text"
          placeholder="What are we saving for? (e.g. Bali Trip)"
          className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-3.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all placeholder-stone-400 dark:placeholder-zinc-500"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            name="target_amount"
            required
            type="number"
            min="1"
            placeholder="Target Amount (Rp)"
            className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-3.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all placeholder-stone-400 dark:placeholder-zinc-500"
          />
          <select
            name="category"
            required
            className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-3.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500 focus:border-transparent font-medium text-sm transition-all"
          >
            <option value="travel">✈️ Travel</option>
            <option value="date_night">🍷 Date Night</option>
            <option value="home">🏡 Home</option>
            <option value="gift">🎁 Gift</option>
            <option value="other">✨ Other</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50"
        >
          {loading ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  )
}
