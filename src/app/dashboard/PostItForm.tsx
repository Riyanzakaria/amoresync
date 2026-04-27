'use client'

import { useRef, useState } from 'react'
import { createPostIt } from './actions'

export default function PostItForm() {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    await createPostIt(formData)
    
    setLoading(false)
    formRef.current?.reset()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 transition-colors duration-300">
      <h3 className="text-lg font-bold mb-4 text-stone-800 dark:text-stone-100">Leave a Post-it</h3>
      <div className="space-y-4">
        <textarea
          name="content"
          required
          maxLength={280}
          rows={3}
          className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-4 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:border-transparent resize-none font-medium text-sm placeholder-stone-400 dark:placeholder-zinc-500 transition-colors"
          placeholder="Write something sweet..."
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            {['yellow', 'pink', 'blue', 'green'].map(color => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color_theme" value={color} className="peer sr-only" defaultChecked={color === 'yellow'} />
                <div className={`w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-stone-800 dark:peer-checked:border-stone-200 shadow-sm transition-transform hover:scale-110
                  ${color === 'yellow' ? 'bg-yellow-300 dark:bg-yellow-600/60' : color === 'pink' ? 'bg-pink-300 dark:bg-pink-600/60' : color === 'blue' ? 'bg-sky-300 dark:bg-sky-600/60' : 'bg-emerald-300 dark:bg-emerald-600/60'}`}
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 dark:bg-rose-600 hover:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-md shadow-rose-200/50 dark:shadow-rose-900/50"
          >
            {loading ? 'Posting...' : 'Post it'}
          </button>
        </div>
      </div>
    </form>
  )
}
