'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 animate-pulse border border-transparent"></div>
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 transition-colors shadow-sm text-stone-600 dark:text-stone-300 border border-rose-100 dark:border-zinc-700 backdrop-blur-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5 text-indigo-300 drop-shadow-sm" />
      ) : (
        <Sun className="h-5 w-5 text-amber-400 drop-shadow-sm" />
      )}
    </button>
  )
}
