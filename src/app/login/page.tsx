'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Jika sudah login & admin → redirect
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      console.log('[LOGIN] getUser:', user?.id, 'profile:', profile, 'err:', error?.message)
      if (profile?.role === 'admin') router.replace('/admin')
    })()
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signErr) {
      setMsg('Email atau password salah.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('Sesi belum aktif. Coba ulangi.')
      setLoading(false)
      return
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[LOGIN] after sign-in profile:', profile, 'err:', error?.message)

    if (error) {
      setMsg('Gagal membaca profil: ' + error.message)   // ← tampilkan error asli (mis. permission denied)
    } else if (profile?.role === 'admin') {
      router.replace('/admin')
    } else {
      setMsg('Akun ini bukan admin. Minta pemilik men-set role=admin di tabel profiles.')
    }
    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[100dvh] bg-gray-50">
      <div className="bg-white shadow rounded p-6 w-80">
        <h1 className="text-xl font-semibold mb-4 text-center">Login Admin</h1>
        {msg && <div className="mb-3 text-sm bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded">{msg}</div>}
        <form onSubmit={handleLogin} className="space-y-3">
          <input type="email" className="w-full border rounded px-3 py-2" placeholder="admin@toko.com"
                 value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="••••••••"
                 value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-60' : ''}`}>
            {loading ? 'Masuk…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
