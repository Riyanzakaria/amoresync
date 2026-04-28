'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function generatePairingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/** Map Supabase/network errors to friendly messages */
function friendlyError(message: string): string {
  if (!message) return 'Terjadi kesalahan. Coba lagi ya 💕'

  const msg = message.toLowerCase()

  // Network / offline
  if (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('failed to fetch') ||
    msg.includes('load failed')
  ) {
    return 'Koneksi internet terputus. Pastikan kamu online, lalu coba lagi 🌐'
  }

  // Auth errors
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Email atau password salah. Coba lagi ya 🥺'
  }
  if (msg.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek inbox-mu untuk link verifikasi 📬'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Coba sign in saja 💌'
  }
  if (msg.includes('password should be at least')) {
    return 'Password minimal 6 karakter ya 🔒'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi ⏳'
  }
  if (msg.includes('invalid email')) {
    return 'Format email tidak valid. Periksa lagi ya 📧'
  }

  // Fallback: return original but with a gentle prefix
  return `Ups, ada masalah: ${message} 🙏`
}

export async function login(formData: FormData) {
  try {
    const supabase = createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return { error: friendlyError(error.message) }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (e: any) {
    return { error: friendlyError(e?.message || '') }
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { data: authData, error: authError } = await supabase.auth.signUp(data)

    if (authError) {
      return { error: friendlyError(authError.message) }
    }

    if (authData.user) {
      let pairing_code = generatePairingCode()
      let inserted = false

      for (let i = 0; i < 3; i++) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            pairing_code,
            display_name: data.email.split('@')[0],
          })

        if (!profileError) {
          inserted = true
          break
        } else {
          pairing_code = generatePairingCode()
        }
      }

      if (!inserted) {
        return { error: 'Gagal membuat profil. Hubungi support kami ya 🙏' }
      }
    }

    revalidatePath('/', 'layout')
    redirect('/pairing')
  } catch (e: any) {
    return { error: friendlyError(e?.message || '') }
  }
}

export async function signout() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch {
    redirect('/login')
  }
}
