'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let unsub: (() => void) | null = null

    async function check() {
      // 1) cek user sekarang
      const { data: { user } } = await supabase.auth.getUser()

      async function verify(uId: string) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uId)
          .single()
        const ok = profile?.role === 'admin'
        setAuthorized(ok)
        setChecking(false)
        if (!ok) router.replace('/login')
      }

      if (user) {
        await verify(user.id)
      } else {
        // 2) tunggu event SIGNED_IN sebentar (kalau baru login)
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) verify(session.user.id)
          else if (event === 'SIGNED_OUT') {
            setChecking(false)
            router.replace('/login')
          }
        })
        unsub = () => sub.subscription.unsubscribe()
        // beri timeout kalau memang tidak ada session
        setTimeout(async () => {
          const { data: { user: u2 } } = await supabase.auth.getUser()
          if (!u2) {
            setChecking(false)
            router.replace('/login')
          }
        }, 800)
      }
    }

    check()
    return () => { if (unsub) unsub() }
  }, [router])

  if (checking) return <div className="p-4">Memeriksa akses…</div>
  if (!authorized) return null

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-lg">Dashboard Servis</h2>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
          className="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700"
        >
          Logout
        </button>
      </div>
      <div>{children}</div>
    </div>
  )
}
