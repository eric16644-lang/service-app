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
  status: string
  tanggal: string
  qris_url?: string
}

export default function AdminPage() {
  const [data, setData] = useState<Service[]>([])

  // 🔄 Ambil data awal
  async function loadData() {
    const { data } = await supabase
      .from('service_orders')
      .select('*')
      .order('tanggal', { ascending: false })
    if (data) setData(data)
  }
function msgTemplate(order:any, status:string) {
  const link = `https://service-app.vercel.app/status/${order.id}`
  const base = `Halo ${order.nama} 👋\nPerangkat: ${order.perangkat}\nNomor Nota: ${order.nomor_nota}\n\n`

  const textMap:any = {
    checking: "Teknisi sedang menganalisa kerusakan 🔍",
    waiting: "Menunggu konfirmasi biaya dari Anda ⏳",
    cancel: "Order dibatalkan ❌",
    repairing: "Sedang diperbaiki 🔧",
    done: "Sudah selesai ✅ silakan ambil perangkat di counter kami"
  }

  return `${base}Status: *${status.toUpperCase()}*\n${textMap[status]}\n\nLacak status di sini:\n${link}`
}


  // 🧭 Update status
  async function updateStatus(id: string, newStatus: string) {
  await supabase.from('service_orders').update({ status: newStatus }).eq('id', id)

  const order = data.find((x) => x.id === id)
  if (!order) return

  // Pesan otomatis sesuai status
  const msg = msgTemplate(order, newStatus)
  await fetch('/api/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: order.no_hp, message: msg })
  })
}


  useEffect(() => {
    loadData()

    // Realtime subscription
    const sub = supabase
      .channel('service_orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, (payload) => {
        console.log('Realtime update:', payload)
        loadData() // refresh otomatis
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const statusOptions = ['checking', 'waiting', 'cancel', 'repairing', 'done']
  const badge = (s:string) => {
  const map:any = {
    checking: 'bg-yellow-100 text-yellow-800',
    waiting: 'bg-amber-100 text-amber-800',
    cancel: 'bg-rose-100 text-rose-700',
    repairing: 'bg-blue-100 text-blue-800',
    done: 'bg-emerald-100 text-emerald-800'
  }
  return `inline-block px-2 py-1 rounded text-xs font-semibold ${map[s] || 'bg-gray-100 text-gray-700'}`
}

// pemakaian:
// <span className={badge(data.status)}>{data.status}</span>


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Dashboard Servis</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Nota</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Perangkat</th>
            <th className="p-2">Status</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.nomor_nota}</td>
              <td className="p-2">{item.nama}</td>
              <td className="p-2">{item.perangkat}</td>
              <td className="p-2 font-semibold">{item.status}</td>
              <td className="p-2">
                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
