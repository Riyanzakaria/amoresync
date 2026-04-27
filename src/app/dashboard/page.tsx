import { createClient } from '@/utils/supabase/server'
import PostItBoard from './PostItBoard'
import Heartbeat from './Heartbeat'
import PostItForm from './PostItForm'
import VirtualCat from './VirtualCat'
import { getOrInitializePet } from './PetActions'

export default async function DashboardHome() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', user.id)
    .single()

  const { data: postIts } = await supabase
    .from('post_its')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Initialize Virtual Pet
  const pet = await getOrInitializePet()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Forms & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <VirtualCat initialPet={pet} currentUserId={user.id} />
          <PostItForm />
        </div>

        {/* Right Column: Interactive Board */}
        <div className="lg:col-span-8">
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
      <Heartbeat currentUserId={user.id} partnerId={profile?.partner_id || ''} />
    </div>
  )
}
