'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { login, signup } from '@/app/auth/actions'
import { ThemeToggle } from '@/components/ThemeToggle'

const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)

    if (isLogin) {
      const { error } = await login(formData)
      if (error) setError(error)
    } else {
      const { error } = await signup(formData)
      if (error) setError(error)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Decorative blobs */}
      <div className="blob blob-rose    w-96 h-96 -top-24 -left-24 animate-float" />
      <div className="blob blob-lavender w-80 h-80 top-1/2  -right-20 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="blob blob-mint    w-72 h-72 bottom-0  left-1/3  animate-float" style={{ animationDelay: '0.7s' }} />

      {/* Header bar */}
      <div className="relative z-10 p-4 flex justify-end">
        <ThemeToggle />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...springConfig, delay: 0.1 }}
          className="max-w-md w-full"
        >
          {/* Card */}
          <div
            className="bubbly-card p-8 sm:p-10 space-y-7"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdf4f8 100%)' }}
          >
            {/* Brand header */}
            <div className="text-center space-y-3">
              {/* Couple avatar pill */}
              <div
                className="w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #FFD1DC 0%, #E8D5F5 60%, #C8F0E0 100%)',
                  boxShadow: '0 12px 32px rgba(255,182,193,0.45)',
                }}
              >
                👩‍❤️‍👨
              </div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                AmoreSync
              </h1>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {isLogin
                  ? 'Welcome back, lovely 💕'
                  : 'Create your shared space 🌸'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-bubbly"
                  placeholder="Email address"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-bubbly"
                  placeholder="Password"
                />
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springConfig}
                  className="text-sm font-bold text-center py-3 px-4 rounded-2xl"
                  style={{
                    background: 'rgba(255,182,193,0.3)',
                    color: '#9f1239',
                    border: '1px solid rgba(244,63,94,0.2)',
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                transition={springConfig}
                className="btn-bubbly-primary w-full py-4 text-base"
              >
                {loading
                  ? '✨ Processing...'
                  : isLogin
                  ? 'Sign in 💕'
                  : 'Create Account 🌸'}
              </motion.button>
            </form>

            {/* Toggle login/signup */}
            <div className="text-center">
              <motion.button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
                whileTap={{ scale: 0.96 }}
                transition={springConfig}
                className="text-sm font-bold transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <span style={{ color: '#f43f5e' }}>
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
