'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    setPermission(Notification.permission)

    // If already granted, try to auto-subscribe
    if (Notification.permission === 'granted') {
      autoSubscribe()
    } else if (Notification.permission === 'default') {
      // Show banner after 3 seconds on first visit
      const shown = sessionStorage.getItem('push-banner-shown')
      if (!shown) {
        setTimeout(() => {
          setShowBanner(true)
          sessionStorage.setItem('push-banner-shown', '1')
        }, 3000)
      }
    }
  }, [])

  async function autoSubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        setSubscribed(true)
        return
      }
      await subscribe(reg)
    } catch {
      // silently fail
    }
  }

  async function subscribe(reg?: ServiceWorkerRegistration) {
    setLoading(true)
    try {
      const registration = reg ?? await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      setSubscribed(true)
      setShowBanner(false)
    } catch {
      // user denied or error
    } finally {
      setLoading(false)
    }
  }

  async function handleEnable() {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      await subscribe()
    } else {
      setShowBanner(false)
    }
  }

  // SW navigate message handler
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE') {
        window.location.href = event.data.url
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  if (subscribed || permission === 'denied') return null

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div
            className="rounded-3xl p-4 shadow-2xl flex items-start gap-4"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #fdf0f5 100%)',
              border: '1px solid rgba(255,182,193,0.4)',
              boxShadow: '0 20px 60px rgba(255,182,193,0.35)',
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FFD1DC, #E8D5F5)' }}
            >
              🔔
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Aktifkan Notifikasi
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Tahu saat pasanganmu kirim heartbeat, pesan, atau update goals 💕
              </p>

              <div className="flex gap-2 mt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnable}
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e879a0)' }}
                >
                  {loading ? '...' : 'Aktifkan 🔔'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBanner(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold"
                  style={{ background: 'rgba(255,182,193,0.15)', color: 'var(--text-muted)' }}
                >
                  Nanti
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
