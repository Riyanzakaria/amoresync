import { createClient } from '@/utils/supabase/server'
import ProfileEditor from '@/app/profile/AvatarUpload'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileEditor initialProfile={profile} />
    </div>
  )
}
