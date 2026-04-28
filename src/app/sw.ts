// AmoreSync Service Worker — powered by Serwist v9
import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

// ── Push Notification Handler ───────────────────────────────────
self.addEventListener('push', (event: { data: { json: () => unknown } | null; waitUntil: (p: Promise<unknown>) => void }) => {
  if (!event.data) return

  const data = event.data.json() as {
    title: string
    body: string
    url?: string
    tag?: string
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: data.tag || 'amoresync',
      renotify: true,
      data: { url: data.url || '/dashboard' },
    })
  )
})

// ── Notification Click → Open App ──────────────────────────────
self.addEventListener('notificationclick', (event: { notification: { close: () => void; data?: { url?: string } }; waitUntil: (p: Promise<unknown>) => void }) => {
  event.notification.close()
  const url: string = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList: { focus: () => void; postMessage: (m: unknown) => void; url: string }[]) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url })
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
