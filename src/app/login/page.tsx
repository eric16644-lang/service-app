'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Jika sudah login & admin, baru redirect
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.role === 'admin') router.replace('/admin')
    })()
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah')
      setLoading(false)
      return
    }

    // cek role setelah login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sesi belum terbaca. Coba ulangi.')
      setLoading(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'admin') {
      router.replace('/admin')
    } else {
      setError('Akun ini bukan admin. Hubungi pemilik untuk diberi akses.')
    }
    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[100dvh] bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80">
        <h1 className="text-xl font-semibold mb-4 text-center">Login Admin</h1>

        {error && (
          <div className="mb-3 text-sm bg-rose-100 text-rose-700 border border-rose-300 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="admin@tokoservis.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded font-medium ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Masuk…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
