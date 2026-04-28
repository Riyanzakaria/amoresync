import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendPushToUser, type PushPayload } from '@/lib/webpush'

// POST /api/push/heartbeat
// Also used by spinner with an 'override' payload
export async function POST(request: NextRequest) {
  try {
    const { partnerId, override } = await request.json() as {
      partnerId: string
      override?: PushPayload
    }
    if (!partnerId) return NextResponse.json({ ok: false })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false })

    let payload: PushPayload

    if (override) {
      payload = override
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
      const name = profile?.display_name || 'Pasanganmu'
      payload = {
        title: `💗 Heartbeat dari ${name}!`,
        body: 'Pasanganmu mengirim detak jantung untukmu 💕',
        url: '/dashboard',
        tag: 'heartbeat',
      }
    }

    await sendPushToUser(partnerId, payload)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
