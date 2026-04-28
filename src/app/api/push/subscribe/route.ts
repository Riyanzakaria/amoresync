import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST /api/push/subscribe
// Body: { subscription: PushSubscriptionJSON }
export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json() as { subscription: unknown }
    if (!subscription) {
      return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert: one record per device (based on endpoint)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: user.id, subscription },
        { onConflict: 'user_id, endpoint' }
      )

    if (error) {
      // Fallback: insert ignoring conflict
      await supabase
        .from('push_subscriptions')
        .insert({ user_id: user.id, subscription })
        .throwOnError()
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE /api/push/subscribe
// Body: { endpoint: string }
export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json() as { endpoint: string }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .filter('subscription->>endpoint', 'eq', endpoint)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
