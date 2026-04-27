'use client'

import { useState } from 'react'
import { login, signup } from '@/app/auth/actions'
import { ThemeToggle } from '@/components/ThemeToggle'

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
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#1a1525] transition-colors duration-300 selection:bg-rose-200">
      <div className="p-4 flex justify-end">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800/80 p-8 sm:p-10 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 backdrop-blur-md">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2">
              AmoreSync <span className="text-rose-400">❤️</span>
            </h2>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400 font-medium">
              {isLogin ? 'Welcome back to your shared space' : 'Create a new space for you and your partner'}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-2xl relative block w-full px-4 py-3.5 border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 placeholder-stone-400 dark:placeholder-zinc-500 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:border-transparent sm:text-sm font-medium transition-all"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-2xl relative block w-full px-4 py-3.5 border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 placeholder-stone-400 dark:placeholder-zinc-500 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 focus:border-transparent sm:text-sm font-medium transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-600 dark:text-rose-400 text-sm font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-extrabold rounded-2xl text-white bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 transition-all shadow-lg shadow-rose-200/50 dark:shadow-rose-900/50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-extrabold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
