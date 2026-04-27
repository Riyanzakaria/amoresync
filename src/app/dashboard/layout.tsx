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

  let partnerName = 'your partner'
  if (profile?.partner_id) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', profile.partner_id)
      .single()
    if (partner) partnerName = partner.display_name || 'your partner'
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'you'

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Decorative floating blobs */}
      <div className="blob blob-rose w-80 h-80 -top-20 -left-20 animate-float" />
      <div className="blob blob-lavender w-96 h-96 top-1/3 -right-32" style={{ animationDelay: '1.5s' }} />
      <div className="blob blob-mint w-64 h-64 bottom-1/4 left-1/4 animate-float" style={{ animationDelay: '0.8s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 lg:pb-10 space-y-6">

        {/* ── Global Header ──────────────────────────────────────── */}
        <header className="bubbly-card bubbly-card-gradient px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left: Branding + greeting */}
          <div className="flex items-center gap-4">
            {/* Cute couple illustration blob */}
            <div
              className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-2xl select-none flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FFD1DC 0%, #E8D5F5 100%)',
                boxShadow: '0 6px 20px rgba(255,182,193,0.4)',
              }}
            >
              👩‍❤️‍👨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  AmoreSync
                </h1>
                <span className="text-xl animate-pulse-soft">💕</span>
              </div>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Hi, <span style={{ color: '#f43f5e' }}>{displayName}</span> ✨ &nbsp;·&nbsp; Paired with{' '}
                <span className="font-bold" style={{ color: '#c9a7e8' }}>{partnerName}</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={signout}>
              <button
                type="submit"
                className="btn-bubbly-soft text-sm"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* ── Main Body ──────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardNav />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
