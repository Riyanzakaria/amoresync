'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Target, Gamepad2, User } from 'lucide-react'

const navItems = [
  { name: 'Home',    href: '/dashboard',         icon: Home,     emoji: '🏠', color: '#FFD1DC' },
  { name: 'Goals',   href: '/dashboard/goals',   icon: Target,   emoji: '🎯', color: '#E8D5F5' },
  { name: 'Play',    href: '/dashboard/play',    icon: Gamepad2, emoji: '🎮', color: '#C8F0E0' },
  { name: 'Profile', href: '/dashboard/profile', icon: User,     emoji: '🌸', color: '#FFE4B5' },
]

const springTransition = { type: 'spring', stiffness: 300, damping: 20 } as const

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Mobile Bottom Navigation ─────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 182, 193, 0.25)',
          boxShadow: '0 -8px 32px rgba(255,182,193,0.15)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 relative"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: item.color, opacity: 0.85 }}
                    transition={springTransition}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={springTransition}
                  className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all`}
                >
                  {isActive ? (
                    <span className="text-xl select-none">{item.emoji}</span>
                  ) : (
                    <item.icon
                      size={20}
                      className="transition-colors"
                      style={{ color: isActive ? '#f43f5e' : 'var(--text-muted)' }}
                    />
                  )}
                </motion.div>
              </div>
              <span
                className="text-[10px] font-bold transition-colors"
                style={{ color: isActive ? '#f43f5e' : 'var(--text-muted)' }}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ── Desktop Sidebar ────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 h-fit sticky top-8">
        <div
          className="bubbly-card p-4 flex flex-col gap-2"
          style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdf4f8 100%)' }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  transition={springTransition}
                  className="relative flex items-center gap-3 px-4 py-3 rounded-[1.5rem] font-bold text-sm cursor-pointer transition-all"
                  style={{
                    background: isActive ? item.color : 'transparent',
                    color: isActive ? '#c0396b' : 'var(--text-muted)',
                    boxShadow: isActive
                      ? '0 6px 20px rgba(255,182,193,0.3)'
                      : 'none',
                  }}
                >
                  <span className="text-lg select-none">{item.emoji}</span>
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktop-active-dot"
                      className="ml-auto w-2 h-2 rounded-full bg-rose-400"
                      transition={springTransition}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}
