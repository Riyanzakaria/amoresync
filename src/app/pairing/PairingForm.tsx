'use client'

import { useState } from 'react'
import { submitPairingCode } from './actions'

export default function PairingForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const { error: submitError } = await submitPairingCode(formData)

    if (submitError) {
      setError(submitError)
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="partner_code" className="sr-only">Partner's Code</label>
        <input
          id="partner_code"
          name="partner_code"
          type="text"
          required
          maxLength={6}
          className="appearance-none rounded-2xl relative block w-full px-4 py-4 border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 placeholder-stone-400 dark:placeholder-zinc-500 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:border-transparent sm:text-lg text-center font-black tracking-widest uppercase transition-all"
          placeholder="ENTER CODE"
        />
      </div>

      {error && (
        <div className="text-rose-600 dark:text-rose-400 text-sm font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 transition-all shadow-lg shadow-rose-200/50 dark:shadow-rose-900/50"
      >
        {loading ? 'Pairing...' : 'Connect Accounts'}
      </button>
    </form>
  )
}
