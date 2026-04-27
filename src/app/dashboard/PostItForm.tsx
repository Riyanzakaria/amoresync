'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createPostIt } from './actions'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

const colorOptions = [
  { value: 'yellow', bg: '#FEF9C3', dot: '#FDE047', label: 'Lemon' },
  { value: 'pink',   bg: '#FFE4E6', dot: '#FB7185', label: 'Blush' },
  { value: 'blue',   bg: '#E0F2FE', dot: '#38BDF8', label: 'Sky' },
  { value: 'green',  bg: '#D1FAE5', dot: '#34D399', label: 'Mint' },
]

export default function PostItForm() {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('yellow')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createPostIt(formData)
    setLoading(false)
    formRef.current?.reset()
    setSelectedColor('yellow')
  }

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: 0.2 }}
      className="bubbly-card p-6"
      style={{ background: 'linear-gradient(160deg, #fff 0%, #fdf4f8 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: '#FFE4E6' }}
        >
          📌
        </div>
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Leave a sweet note
        </h3>
      </div>

      <div className="space-y-4">
        {/* Textarea */}
        <textarea
          name="content"
          required
          maxLength={280}
          rows={3}
          className="input-bubbly resize-none"
          placeholder="Write something sweet... 💌"
          style={{ fontFamily: 'inherit' }}
        />

        {/* Color picker + Submit */}
        <div className="flex items-center justify-between gap-3">
          {/* Color swatches */}
          <div className="flex gap-2">
            {colorOptions.map((c) => (
              <motion.label
                key={c.value}
                title={c.label}
                whileTap={{ scale: 0.85 }}
                transition={springConfig}
                className="cursor-pointer"
              >
                <input
                  type="radio"
                  name="color_theme"
                  value={c.value}
                  className="peer sr-only"
                  checked={selectedColor === c.value}
                  onChange={() => setSelectedColor(c.value)}
                />
                <div
                  className="w-8 h-8 rounded-full transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-rose-400 peer-checked:scale-110"
                  style={{ background: c.dot }}
                />
              </motion.label>
            ))}
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={springConfig}
            className="btn-bubbly-primary px-6 py-2.5 text-sm flex-shrink-0"
          >
            {loading ? '✨ Posting...' : 'Post it 💕'}
          </motion.button>
        </div>
      </div>
    </motion.form>
  )
}
