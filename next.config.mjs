import withSerwist from '@serwist/next'

/** @type {import('next').NextConfig} */
const nextConfig = {}

const withSerwistConfig = withSerwist({
  // The path to your service worker source file
  swSrc: 'src/app/sw.ts',
  // Where Serwist will output the compiled service worker
  swDest: 'public/sw.js',
  // Disable in development to avoid caching issues
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwistConfig(nextConfig)
