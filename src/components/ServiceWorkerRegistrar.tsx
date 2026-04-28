'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Serwist generates /sw.js at build time via next.config.mjs
    // In development, SW is disabled (see next.config.mjs: disable in dev)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // SW registration failed silently — app still works normally
        })
    }
  }, [])

  return null
}
