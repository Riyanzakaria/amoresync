import { createClient } from '@/utils/supabase/server'
import WishlistBoard from '../WishlistBoard'
import WishlistForm from '../WishlistForm'

export default async function GoalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: wishlistsRaw } = await supabase
    .from('wishlist_savings')
    .select('*, savings_transactions(amount)')
    .order('created_at', { ascending: false })

  const wishlists = (wishlistsRaw || []).map(w => {
    const total_saved = w.savings_transactions?.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0) || 0;
    return {
      id: w.id,
      title: w.title,
      target_amount: Number(w.target_amount),
      category: w.category,
      total_saved
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-4">
          <WishlistForm />
        </div>
        {/* Right Column: Board */}
        <div className="lg:col-span-8">
          <WishlistBoard wishlists={wishlists} />
        </div>
      </div>
    </div>
  )
}
