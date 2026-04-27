import { createClient } from '@/utils/supabase/server'
import { signout } from '@/app/auth/actions'
import { redirect } from 'next/navigation'
import PostItBoard from './PostItBoard'
import PostItForm from './PostItForm'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
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

  const { data: postIts } = await supabase
    .from('post_its')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#1a1525] p-4 sm:p-8 selection:bg-rose-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 backdrop-blur-md">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <span>AmoreSync</span>
              <span className="text-rose-400 animate-[pulse_3s_ease-in-out_infinite]">❤️</span>
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 font-medium">
              You are paired with <span className="font-bold text-rose-500 dark:text-rose-400">{partnerName}</span>
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <PostItForm />
            <div className="bg-white dark:bg-zinc-800/80 p-6 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50">
              <h3 className="text-lg font-bold mb-2 text-stone-800 dark:text-stone-100">Savings Goal</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 font-medium">You both haven't set a wishlist goal yet.</p>
              <div className="w-full bg-stone-100 dark:bg-zinc-900/50 rounded-full h-3">
                <div className="bg-rose-400 dark:bg-rose-500 h-3 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-800/80 rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-lg dark:shadow-rose-900/20 border border-rose-50 dark:border-zinc-700/50 min-h-[500px] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-rose-50 dark:border-zinc-700/50 bg-stone-50/50 dark:bg-zinc-800/30">
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <span>📌</span> Our Board
                </h2>
              </div>
              <div className="flex-1 bg-[#faf8f5]/50 dark:bg-zinc-900/30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
                <PostItBoard initialPostIts={postIts || []} currentUserId={user.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
