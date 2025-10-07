'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // cek role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setOk(profile?.role === 'admin')
      if (profile?.role !== 'admin') router.push('/login')
    })()
  }, [router])

  if (ok === null) return <div className="p-4">Memeriksa akses…</div>
  if (!ok) return <div className="p-4">Akses ditolak</div>
  return <>{children}</>
}
