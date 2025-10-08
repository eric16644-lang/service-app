'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function verify() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // (opsional) auto-upsert profile jika belum ada
      await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: false })

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        setMessage('Gagal membaca profil. Coba refresh.')
        setChecking(false)
        return
      }

      if (profile?.role === 'admin') {
        setAllowed(true)
        setChecking(false)
      } else {
        // ❗ Jangan redirect ke /login lagi—tampilkan pesan supaya tidak loop
        setMessage('Akses ditolak. Akun ini bukan admin.')
        setAllowed(false)
        setChecking(false)
      }
    }
    verify()
  }, [router])

  if (checking) return <div className="p-4">Memeriksa akses…</div>
  if (!allowed) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-lg font-semibold mb-2">Tidak memiliki akses</h2>
        <p className="text-sm text-gray-600 mb-4">{message || 'Hubungi pemilik untuk diberi akses admin.'}</p>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
        >
          Kembali ke Login
        </button>
      </div>
    )
  }

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
