'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

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
  status_qr_url?: string | null
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function AdminPage() {
  const [data, setData] = useState<Service[]>([])
  const [qrLoading, setQrLoading] = useState<Record<string, boolean>>({})

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
    const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://service-app.vercel.app'}/status/${order.id}`
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
    const { error } = await supabase.from('service_orders').update({ status: newStatus }).eq('id', id)
    if (error) return console.error(error)

    const order = data.find((x) => x.id === id)
    if (!order) return
    const msg = msgTemplate(order, newStatus)

    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: order.no_hp, message: msg }),
    })
  }

  // 🧩 Generate QR untuk row yang belum punya
  async function generateQR(id: string) {
    try {
      setQrLoading((p) => ({ ...p, [id]: true }))
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        console.error('QR failed:', j?.error || res.statusText)
      }
      await loadData()
    } finally {
      setQrLoading((p) => ({ ...p, [id]: false }))
    }
  }

  useEffect(() => {
    loadData()
    const sub = supabase
      .channel('service_orders_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => loadData())
      .subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  const statusOptions = ['checking', 'waiting', 'cancel', 'repairing', 'done']
  const badge = (s: string) => {
    const map: Record<string, string> = {
      checking: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200',
      waiting: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200',
      cancel: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
      repairing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
      done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    }
    return `inline-block px-2 py-0.5 rounded text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'}`
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header / Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard Servis</h1>

        <Link
          href="/input"
          className="
            inline-flex items-center gap-2 rounded-lg
            bg-blue-600 text-white px-3 py-2 text-sm font-medium
            hover:bg-blue-700 active:bg-blue-800
            dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
            shadow-sm
          "
          title="Tambah order servis baru"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
          </svg>
          Input Servis
        </Link>
        <Link
          href="/garansi"
          className="
            inline-flex items-center gap-2 rounded-lg
            bg-blue-600 text-white px-3 py-2 text-sm font-medium
            hover:bg-blue-700 active:bg-blue-800
            dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
            shadow-sm
          "
          title="Pengambilan Service"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>
          </svg>
          Garansi
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-neutral-950">
        <table className="w-full text-sm text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-neutral-900/70 text-gray-800 dark:text-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Nota</th>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Perangkat</th>
              <th className="p-2 text-left">Kelengkapan</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">QR</th>
              <th className="p-2 text-left">Menu</th>
              <th className="p-2 text-left">Ubah Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Belum ada order / tidak bisa memuat data.
                </td>
              </tr>
            )}

            {data.map((item, idx) => {
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
                <tr
                  key={item.id}
                  className={`
                    transition-colors
                    ${idx % 2 ? 'bg-gray-50/60 dark:bg-neutral-900/40' : 'bg-white dark:bg-neutral-950'}
                    hover:bg-gray-50 dark:hover:bg-neutral-900
                  `}
                >
                  <td className="p-2 whitespace-nowrap">{item.nomor_nota}</td>
                  <td className="p-2">{item.nama}</td>
                  <td className="p-2">{item.perangkat}</td>
                  <td className="p-2 text-xs">{kelengkapan || '-'}</td>
                  <td className="p-2">
                    <span className={badge(item.status)}>{item.status}</span>
                  </td>

                  {/* QR */}
                  <td className="p-2">
                    {item.status_qr_url ? (
                      <a
                        href={item.status_qr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-600 dark:text-blue-400"
                        title="Lihat QR"
                      >
                        Lihat
                      </a>
                    ) : (
                      <button
                        onClick={() => generateQR(item.id)}
                        disabled={loading}
                        className={`px-2 py-1 border rounded
                            border-gray-300 dark:border-gray-700
                            bg-white dark:bg-neutral-950
                            hover:bg-gray-50 dark:hover:bg-neutral-900
                            ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title="Generate QR untuk tracking"
                      >
                        {loading ? 'Membuat…' : 'Generate QR'}
                      </button>
                    )}
                  </td>

                  {/* Menu cepat: Nota & Lacak */}
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/status/${item.id}/nota`}
                        target="_blank"
                        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                                   bg-white dark:bg-neutral-950 hover:bg-gray-50 dark:hover:bg-neutral-900"
                        title="Buka Nota (print)"
                      >
                        Nota
                      </Link>
                      <Link
                        href={`/status/${item.id}`}
                        target="_blank"
                        className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                                   bg-white dark:bg-neutral-950 hover:bg-gray-50 dark:hover:bg-neutral-900"
                        title="Halaman status publik"
                      >
                        Lacak
                      </Link>
                    </div>
                  </td>

                  {/* Ubah status */}
                  <td className="p-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-700
                                 bg-white dark:bg-neutral-950 p-1 rounded"
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
    </div>
  )
}
