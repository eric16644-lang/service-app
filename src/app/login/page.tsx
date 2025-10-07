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

  // If already signed-in, go to /admin
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace('/admin')
    })()
  }, [router])

  async function ensureSessionAndGo() {
    // up to ~1s polling to ensure session is visible to the app
    for (let i = 0; i < 5; i++) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.replace('/admin')
        // hard fallback if router stuck:
        setTimeout(() => { if (location.pathname === '/login') location.assign('/admin') }, 300)
        return
      }
      await new Promise(r => setTimeout(r, 200))
    }
    // if still no user:
    setError('Login berhasil namun sesi belum tersinkron. Coba ulangi atau refresh halaman.')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Email atau password salah')
      return
    }
    await ensureSessionAndGo()
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80">
        <h1 className="text-xl font-semibold mb-4 text-center">Login Admin</h1>

        {error && (
          <div className="mb-3 text-sm bg-rose-100 text-rose-700 border border-rose-300 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="admin@tokoservis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded font-medium ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Masuk...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
