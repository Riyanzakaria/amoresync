import { redirect } from 'next/navigation'

// Root "/" selalu redirect ke /dashboard
// Middleware akan mengarahkan ke /login jika belum login
export default function RootPage() {
  redirect('/dashboard')
}
