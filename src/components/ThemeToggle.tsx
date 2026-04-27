'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="w-11 h-11 rounded-full animate-pulse"
        style={{ background: 'rgba(255,182,193,0.2)' }}
      />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      transition={springConfig}
      aria-label="Toggle theme"
      className="w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #312148, #1E1625)'
          : 'linear-gradient(135deg, #FFD1DC, #FFF0F3)',
        boxShadow: '0 4px 16px rgba(255,182,193,0.35)',
        border: '1.5px solid rgba(255,182,193,0.4)',
      }}
    >
      <span className="select-none">{isDark ? '🌙' : '☀️'}</span>
    </motion.button>
  )
}
