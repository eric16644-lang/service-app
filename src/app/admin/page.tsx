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
  estimasi?: number | null
  status: string
  tanggal: string
  qris_url?: string | null
  status_qr_url?: string | null   // ⬅️ QR status (public URL) kalau sudah dibuat
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function AdminPage() {
  const [data, setData] = useState<Service[]>([])
  const [qrLoading, setQrLoading] = useState<Record<string, boolean>>({}) // per-row loader

  // 🔄 ambil data awal
  async function loadData() {
    const { data: rows, error } = await supabase
      .from('service_orders')
      .select('*')
      .order('tanggal', { ascending: false })
    if (!error && rows) setData(rows)
  }

  // 💬 template pesan WA
  function msgTemplate(order: Service, status: string) {
    const link = `https://service-app.vercel.app/status/${order.id}`
    const base = `Halo ${order.nama} 👋\nPerangkat: ${order.perangkat}\nNomor Nota: ${order.nomor_nota}\n\n`
    const textMap: Record<string, string> = {
      checking: 'Teknisi sedang menganalisa kerusakan 🔍',
      waiting: 'Menunggu konfirmasi biaya dari Anda ⏳',
      cancel: 'Order dibatalkan ❌',
      repairing: 'Sedang diperbaiki 🔧',
      done: 'Sudah selesai ✅ silakan ambil perangkat di counter kami',
    }
    return `${base}Status: *${status.toUpperCase()}*\n${textMap[status] ?? ''}\n\nLacak status di sini:\n${link}`
  }

  // 🧭 ubah status
  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) return console.error(error)

    // kirim WA otomatis
    const order = data.find((x) => x.id === id)
    if (!order) return
    const msg = msgTemplate(order, newStatus)

    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: order.no_hp, message: msg }),
    })
  }

  // 🧩 Generate QR untuk row lama yang belum punya
  async function generateQR(id: string) {
    try {
      setQrLoading((prev) => ({ ...prev, [id]: true }))
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('QR failed:', json?.error || res.statusText)
        return
      }
      // refresh list agar status_qr_url terisi
      await loadData()
    } finally {
      setQrLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  useEffect(() => {
    loadData()
    // 🔔 realtime update
    const sub = supabase
      .channel('service_orders_admin')
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

  const statusOptions = ['checking', 'waiting', 'cancel', 'repairing', 'done']
  const badge = (s: string) => {
    const map: Record<string, string> = {
      checking: 'bg-yellow-100 text-yellow-800',
      waiting: 'bg-amber-100 text-amber-800',
      cancel: 'bg-rose-100 text-rose-700',
      repairing: 'bg-blue-100 text-blue-800',
      done: 'bg-emerald-100 text-emerald-800',
    }
    return `inline-block px-2 py-1 rounded text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Dashboard Servis</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Nota</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Perangkat</th>
            <th className="p-2">Kelengkapan</th>
            <th className="p-2">Status</th>
            <th className="p-2">QR</th>    {/* ⬅️ kolom QR */}
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const kelengkapan = [
              item.sim_card ? 'SIM' : null,
              item.sd_card ? 'SD' : null,
              item.charger ? 'Charger' : null,
              item.box ? 'Box' : null,
              item.phone_case ? 'Case' : null,
            ]
              .filter(Boolean)
              .join(', ')

            const loading = !!qrLoading[item.id]

            return (
              <tr key={item.id} className="border-t align-top">
                <td className="p-2">{item.nomor_nota}</td>
                <td className="p-2">{item.nama}</td>
                <td className="p-2">{item.perangkat}</td>
                <td className="p-2 text-xs">{kelengkapan || '-'}</td>
                <td className="p-2">
                  <span className={badge(item.status)}>{item.status}</span>
                </td>

                {/* ⬇️ Kolom QR */}
                <td className="p-2">
                  {item.status_qr_url ? (
                    <a
                      href={item.status_qr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600"
                      title="Lihat QR"
                    >
                      Lihat
                    </a>
                  ) : (
                    <button
                      onClick={() => generateQR(item.id)}
                      disabled={loading}
                      className={`px-2 py-1 border rounded ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title="Generate QR untuk tracking"
                    >
                      {loading ? 'Membuat…' : 'Generate QR'}
                    </button>
                  )}
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
