'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  function log(...args: any[]) { console.log('[ADMIN]', ...args) }

  useEffect(() => {
    let unsub: (() => void) | null = null

    async function verify(userId: string) {
      // profil harus bisa dibaca oleh user sendiri (cek RLS di bawah)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      log('profile:', profile, error)
      const ok = true
      setAuthorized(ok)
      setChecking(false)
      if (!ok) router.replace('/login')
    }

    async function boot() {
      const { data: { user } } = await supabase.auth.getUser()
      log('getUser admin:', user)

      if (user) {
        await verify(user.id)
      } else {
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          log('auth event:', event, !!session?.user)
          if (session?.user) verify(session.user.id)
          else if (event === 'SIGNED_OUT') {
            setChecking(false)
            router.replace('/login')
          }
        })
        unsub = () => sub.subscription.unsubscribe()

        // timeout kalau memang tidak ada sesi
        setTimeout(async () => {
          const { data: { user: u2 } } = await supabase.auth.getUser()
          log('timeout recheck:', u2)
          if (!u2) {
            setChecking(false)
            router.replace('/login')
          }
        }, 900)
      }
    }

    boot()
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
