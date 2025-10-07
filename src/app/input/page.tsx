'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function InputServicePage() {
  const [form, setForm] = useState({ nama: '', no_hp: '', perangkat: '', keluhan: '', estimasi: '' })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nomorNota = `SRV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
    const { data, error } = await supabase
      .from('service_orders')
      .insert([{ ...form, estimasi: Number(form.estimasi), nomor_nota: nomorNota }])
      .select()
      .single()

    if (error) return alert(error.message)
    router.push(`/status/${data.id}`)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Input Servis Baru</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {['nama','no_hp','perangkat','keluhan','estimasi'].map((f) => (
          <input key={f} required placeholder={f} className="p-2 border rounded"
            onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        ))}
        <button className="bg-blue-600 text-white py-2 rounded">Simpan & Cetak Nota</button>
      </form>
    </div>
  )
}
