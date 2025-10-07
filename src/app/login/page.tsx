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
  const [userDump, setUserDump] = useState<string>('')

  // Tulis helper log agar terlihat jelas di console
  function log(...args: any[]) {
    console.log('[LOGIN]', ...args)
  }

  // Jika sudah login, langsung ke /admin (sekalian log)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      log('getUser on mount:', user)
      if (user) router.replace('/admin')
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      log('onAuthStateChange:', event, !!session?.user)
      if (session?.user) {
        router.replace('/admin')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    console.clear()
    log('Attempt login:', email)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    log('signInWithPassword result:', { user: data.user, error })

    if (error) {
      setMsg('Email atau password salah')
      setLoading(false)
      return
    }

    // polling pendek untuk pastikan session kebaca
    for (let i = 0; i < 5; i++) {
      const { data: { user } } = await supabase.auth.getUser()
      log(`poll ${i} getUser:`, user)
      setUserDump(JSON.stringify(user, null, 2))
      if (user) {
        router.replace('/admin')
        // fallback keras jika router macet
        setTimeout(() => {
          if (location.pathname === '/login') location.assign('/admin')
        }, 300)
        setLoading(false)
        return
      }
      await new Promise(r => setTimeout(r, 200))
    }

    setMsg('Login berhasil namun sesi belum tersinkron. Coba refresh halaman.')
    setLoading(false)
  }

  return (
    <div className="flex justify-center items-center min-h-[100dvh] bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80">
        <h1 className="text-xl font-semibold mb-4 text-center">Login Admin</h1>

        {msg && (
          <div className="mb-3 text-sm bg-amber-100 text-amber-800 border border-amber-300 px-3 py-2 rounded">
            {msg}
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
            {loading ? 'Masuk…' : 'Login'}
          </button>
        </form>

        {/* Panel debug kecil (hapus di produksi jika mau) */}
        <details className="mt-4 text-xs opacity-80">
          <summary>Debug</summary>
          <div className="mt-2">
            <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
            <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">{userDump || '(empty)'}</pre>
          </div>
        </details>
      </div>
    </div>
  )
}
