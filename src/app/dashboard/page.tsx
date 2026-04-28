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

  const pet = await getOrInitializePet()

  return (
    <div className="space-y-6 animate-fade-up pb-20">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

        {/* ── Left Column: Pet + Note Form ──────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <VirtualCat initialPet={pet} />
          <PostItForm />
        </div>

        {/* ── Right Column: Post-it Board ───────────────────────── */}
        <div className="lg:col-span-8">
          <div
            className="bubbly-card overflow-hidden flex flex-col min-h-[480px]"
            style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fdf0f5 100%)' }}
          >
            {/* Board header */}
            <div
              className="flex items-center gap-3 px-6 py-5"
              style={{ borderBottom: '1px solid rgba(255,182,193,0.2)' }}
            >
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FFD1DC, #E8D5F5)' }}
              >
                📝
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Our Board
              </h2>
              {/* Unread badge */}
              {postIts && postIts.filter(p => !p.is_read).length > 0 && (
                <span
                  className="ml-auto text-xs font-bold rounded-full px-3 py-1"
                  style={{ background: '#FFD1DC', color: '#c0396b' }}
                >
                  {postIts.filter(p => !p.is_read).length} unread
                </span>
              )}
            </div>

            {/* Board content */}
            <div className="flex-1">
              <PostItBoard initialPostIts={postIts || []} currentUserId={user.id} />
            </div>
          </div>
        </div>
      </div>

      <Heartbeat currentUserId={user.id} partnerId={profile?.partner_id || ''} />
    </div>
  )
}
