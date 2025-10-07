'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Service = {
  id: string
  nomor_nota: string
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi?: number
  status: 'checking' | 'waiting' | 'cancel' | 'repairing' | 'done' | string
  tanggal: string
  qris_url?: string
}

export default function AdminPage() {
  const [data, setData] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // 🔄 Ambil data awal + logging error
  async function loadData() {
  setLoading(true)
  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .order('tanggal', { ascending: false })

  if (error) {
    console.error('Supabase SELECT error:', error)
    alert('Gagal memuat data: ' + error.message)
  } else {
    console.log('Data hasil SELECT:', data)   // 👈 Tambah log ini
    setData(data || [])
  }
  setLoading(false)
}


  // 💬 Template pesan WA
  function msgTemplate(order: Service, status: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const link = `${baseUrl}/status/${order.id}`
    const base =
      `Halo ${order.nama} 👋\nPerangkat: ${order.perangkat}\nNomor Nota: ${order.nomor_nota}\n\n`

    const textMap: Record<string, string> = {
      checking: 'Teknisi sedang menganalisa kerusakan 🔍',
      waiting: 'Menunggu konfirmasi biaya dari Anda ⏳',
      cancel: 'Order dibatalkan ❌',
      repairing: 'Sedang diperbaiki 🔧',
      done: 'Sudah selesai ✅ silakan ambil perangkat di counter kami',
    }

    return `${base}Status: *${status.toUpperCase()}*\n${textMap[status] || ''}\n\nLacak status:\n${link}`
  }

  // 🧭 Update status + kirim WA
  async function updateStatus(id: string, newStatus: Service['status']) {
    const { error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error('Supabase UPDATE error:', error)
      alert('Gagal update status: ' + error.message)
      return
    }

    const order = data.find((x) => x.id === id)
    if (!order) return

    try {
      const msg = msgTemplate(order, newStatus)
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: order.no_hp, message: msg }),
      })
    } catch (e) {
      console.error('WhatsApp notify error:', e)
    }
  }

  useEffect(() => {
    // tampilkan ENV untuk debugging (hapus di production bila perlu)
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    loadData()

    // Realtime subscription
    const sub = supabase
      .channel('service_orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_orders' },
        () => loadData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const statusOptions: Service['status'][] = [
    'checking',
    'waiting',
    'cancel',
    'repairing',
    'done',
  ]

  const badge = (s: string) => {
    const map: Record<string, string> = {
      checking: 'bg-yellow-100 text-yellow-800',
      waiting: 'bg-amber-100 text-amber-800',
      cancel: 'bg-rose-100 text-rose-700',
      repairing: 'bg-blue-100 text-blue-800',
      done: 'bg-emerald-100 text-emerald-800',
    }
    return `inline-block px-2 py-1 rounded text-xs font-semibold ${
      map[s] || 'bg-gray-100 text-gray-700'
    }`
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Dashboard Servis</h1>

      <div className="mb-3 text-sm opacity-80">
        Total: <b>{data.length}</b> order
      </div>

      <table className="w-full border border-gray-200 rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left text-black">
            <th className="p-2">Nota</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Perangkat</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-sm">
                Memuat data…
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-3 text-center text-sm">
                Belum ada order / tidak bisa memuat data.
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.nomor_nota}</td>
                <td className="p-2">{item.nama}</td>
                <td className="p-2">{item.perangkat}</td>
                <td className="p-2">
                  <span className={badge(item.status)}>{item.status}</span>
                </td>
                <td className="p-2">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
