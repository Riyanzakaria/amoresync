import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '@/app/auth/actions'
import { ThemeToggle } from '@/components/ThemeToggle'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let partnerName = 'Unknown'
  if (profile?.partner_id) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', profile.partner_id)
      .single()
    if (partner) partnerName = partner.display_name || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1525] p-4 sm:p-8 pb-24 lg:pb-8 selection:bg-rose-200 transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Global Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 backdrop-blur-md">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <span>AmoreSync</span>
              <span className="text-rose-400 animate-[pulse_3s_ease-in-out_infinite]">❤️</span>
            </h1>
            <div className="text-stone-500 dark:text-stone-400 mt-2 font-medium flex items-center gap-2">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="You" className="w-6 h-6 rounded-full object-cover shadow-sm border border-rose-100 dark:border-zinc-700" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-stone-200 dark:bg-zinc-700 flex items-center justify-center text-[10px]">👤</span>
              )}
              <span>You are paired with <span className="font-bold text-rose-500 dark:text-rose-400">{partnerName}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <form action={signout}>
              <button type="submit" className="px-5 py-2.5 bg-rose-50 dark:bg-zinc-900/50 text-rose-700 dark:text-rose-300 rounded-2xl hover:bg-rose-100 dark:hover:bg-zinc-900 transition-colors font-bold text-sm shadow-sm border border-rose-100 dark:border-zinc-800">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardNav />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
