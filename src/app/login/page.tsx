'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setMsg(error ? error.message : 'Link login dikirim ke email Anda ✉️')
    setLoading(false)
  }

  return (
    <div className="max-w-xs mx-auto mt-24 text-sm">
      <h1 className="text-xl font-bold mb-4">Login Admin</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          className="border rounded w-full p-2"
          placeholder="email@toko.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {loading ? 'Mengirim Link…' : 'Kirim Link Login'}
        </button>
      </form>
      {msg && <p className="mt-3 text-center text-gray-700">{msg}</p>}
    </div>
  )
}
