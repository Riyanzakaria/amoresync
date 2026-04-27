'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Gamepad2, User } from 'lucide-react'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Play', href: '/dashboard/play', icon: Gamepad2 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-rose-100 dark:border-zinc-800 flex justify-around p-3 pb-4 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {navItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 flex-1 relative">
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 scale-110 shadow-sm' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400'}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -top-3 w-1 h-1 rounded-full bg-rose-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-zinc-800/80 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 p-6 h-fit sticky top-8">
        <div className="flex flex-col gap-2">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/50' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-zinc-800 dark:hover:text-stone-200'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'scale-110 transition-transform' : ''} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}
