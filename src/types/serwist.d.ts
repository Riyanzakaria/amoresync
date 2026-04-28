// Type declarations for Serwist service worker
// This file is auto-referenced by tsconfig.json

import { PrecacheEntry, SerwistGlobalConfig } from 'serwist'

declare global {
  // Injected by @serwist/next at build time
  interface Window {
    serwist: import('serwist').Serwist
  }
}

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] & { __WB_MANIFEST?: never }
  }
}

export {}
