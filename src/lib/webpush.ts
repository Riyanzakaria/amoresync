import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:amoresync@app.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  // Lazy import createClient to avoid circular deps in edge runtime
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = createClient()

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)

  if (!subscriptions?.length) return

  const message = JSON.stringify(payload)

  await Promise.allSettled(
    subscriptions.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(
          subscription as webpush.PushSubscription,
          message
        )
      } catch (err: unknown) {
        // 410 = subscription expired → remove it
        if (
          err instanceof Error &&
          'statusCode' in err &&
          (err as { statusCode: number }).statusCode === 410
        ) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('subscription->>endpoint', (subscription as { endpoint: string }).endpoint)
        }
      }
    })
  )
}
