'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import QRCode from 'react-qr-code'

type ServiceStatus = 'checking' | 'waiting' | 'cancel' | 'repairing' | 'done'

type Service = {
  id: string
  nomor_nota: string
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi?: number | null
  status: ServiceStatus | string
  status_qr_url?: string | null
  tanggal: string
  qris_url?: string | null
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function StatusPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Service | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', params.id)
      .single<Service>()
    if (!error) setData(data)
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    load()
    const sub = supabase
      .channel('service_orders-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'service_orders' },
        (payload) => {
          const row = payload.new as Service
          if (row.id === params.id) setData(row)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [load, params.id])

  if (loading) return <div className="p-4">Memuat…</div>
  if (!data) return <div className="p-4">Data tidak ditemukan</div>

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

  // Tampilkan hanya kelengkapan yang dicentang
  const kelengkapanList = [
    data.sim_card ? 'SIM Card' : null,
    data.sd_card ? 'SD Card' : null,
    data.charger ? 'Charger' : null,
    data.box ? 'Box' : null,
    data.phone_case ? 'Case' : null,
  ].filter(Boolean) as string[]

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://service-app.vercel.app'

  return (
    <div className="max-w-sm mx-auto mt-6 p-4 border rounded-lg shadow text-sm">
      <h1 className="text-lg font-bold text-center mb-3">Status Servis</h1>

      <p><b>Nomor:</b> {data.nomor_nota}</p>
      <p><b>Nama:</b> {data.nama}</p>
      <p><b>Perangkat:</b> {data.perangkat}</p>

      {kelengkapanList.length > 0 && (
        <p className="mt-1">
          <b>Kelengkapan:</b>{' '}
          {kelengkapanList.map((item) => (
            <span key={item} className="inline-block px-2 py-0.5 mr-1 mb-1 rounded bg-gray-100">
              {item}
            </span>
          ))}
        </p>
      )}

      <p className="mt-1"><b>Keluhan:</b> {data.keluhan}</p>
      <p className="mt-1">
        <b>Status:</b>{' '}
        <span className={badge(String(data.status))}>
          {String(data.status)}
        </span>
      </p>
      <p><b>Tanggal:</b> {new Date(data.tanggal).toLocaleString('id-ID')}</p>

      <div className="mt-4 flex justify-center">
        {data.status_qr_url ? (
          <img src={data.status_qr_url} alt="QR Status" className="w-30 h-30" />
        ) : (
          <QRCode value={`${baseUrl}/status/${data.id}`} size={120} />
        )}
      </div>

      {data.qris_url && (
        <div className="mt-3">
          <p className="text-center font-semibold">QRIS Pembayaran</p>
          <img src={data.qris_url} alt="QRIS" className="mx-auto w-40 h-40" />
        </div>
      )}
    </div>
  )
}
