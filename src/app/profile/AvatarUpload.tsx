'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { Camera, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MOODS = ['😊', '😂', '🥺', '😡', '😴', '🥰', '😭', '🤯', '🤧', '🤢', '😎', '🤒']

export default function ProfileEditor({ initialProfile }: { initialProfile: any }) {
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '')
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '')
  const [mood, setMood] = useState(initialProfile?.current_mood || '😊')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Image compression using Canvas API
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Canvas to Blob failed'))
            },
            'image/webp',
            0.8 // 80% quality
          )
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      setError(null)
      
      // 1. Compress image client-side
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], `${Date.now()}_avatar.webp`, { type: 'image/webp' })

      // 2. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${initialProfile.id}/${compressedFile.name}`, compressedFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
      
      setAvatarUrl(publicUrl)
      
      // Auto save avatar
      const formData = new FormData()
      formData.append('avatar_url', publicUrl)
      await updateProfile(formData)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('display_name', displayName)
    formData.append('current_mood', mood)
    const res = await updateProfile(formData)
    
    if (res?.error) setError(res.error)
    else router.push('/dashboard')
    
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-zinc-800/80 p-8 rounded-3xl shadow-2xl shadow-rose-100/50 dark:shadow-rose-900/10 border border-rose-50 dark:border-zinc-700/50 max-w-md w-full mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-stone-800 dark:text-stone-100 mb-2">Edit Profile</h2>
        <p className="text-stone-500 dark:text-stone-400 font-medium">Personalize how you appear to your partner.</p>
      </div>

      {error && (
        <div className="mb-6 text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
          {error}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-rose-100 dark:border-zinc-700 shadow-md">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-stone-100 dark:bg-zinc-900 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          )}
          
          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            {loading ? <Loader2 className="animate-spin text-white mb-1" /> : <Camera className="text-white mb-1" />}
            <span className="text-white text-xs font-bold">{loading ? 'Uploading...' : 'Change'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              disabled={loading}
            />
          </label>
        </div>
        <p className="text-xs text-stone-400 mt-3 font-medium text-center">
          Tap the image to upload a new picture.<br/>Max size: 800x800, compressed automatically.
        </p>
      </div>

      {/* Name Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Current Mood</label>
          <div className="flex gap-2 flex-wrap justify-center bg-[#faf8f5] dark:bg-zinc-900/50 p-3 rounded-2xl border border-stone-200 dark:border-zinc-700">
            {MOODS.map(m => (
              <button 
                key={m} 
                type="button" 
                onClick={() => setMood(m)} 
                className={`text-2xl p-2 rounded-xl transition-all ${mood === m ? 'bg-rose-100 dark:bg-rose-900/40 scale-110 shadow-sm border border-rose-200 dark:border-rose-700' : 'hover:bg-stone-100 dark:hover:bg-zinc-700/50 grayscale hover:grayscale-0'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Honey, Babe, etc."
            required
            className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-[#faf8f5] dark:bg-zinc-900/50 p-3.5 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 font-bold"
          />
        </div>
        
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-3.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-stone-700 dark:text-stone-300 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
