import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PairingForm from './PairingForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import { signout } from '../auth/actions'

export default async function PairingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('pairing_code, partner_id')
    .eq('id', user.id)
    .single()

  if (profile?.partner_id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#1a1525] transition-colors duration-300 selection:bg-rose-200">
      <div className="p-4 flex justify-between items-center">
        <form action={signout}>
          <button type="submit" className="text-sm font-bold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors">
            Sign out
          </button>
        </form>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-800/80 p-8 sm:p-10 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 backdrop-blur-md">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2">
              Connect <span className="text-rose-400">💞</span>
            </h2>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400 font-medium leading-relaxed">
              Share your code with your partner or enter theirs to link your accounts.
            </p>
          </div>

          <div className="bg-[#faf8f5] dark:bg-zinc-900/50 p-6 rounded-3xl border border-stone-200 dark:border-zinc-700 text-center shadow-inner">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-2 font-bold uppercase tracking-widest">Your Code</p>
            <p className="text-4xl font-black text-rose-500 dark:text-rose-400 tracking-[0.2em]">
              {profile?.pairing_code}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-zinc-800/80 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-widest text-xs rounded-full">Or</span>
            </div>
          </div>

          <PairingForm />

        </div>
      </div>
    </div>
  )
}
