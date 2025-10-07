'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import QRCode from 'react-qr-code'

export default function StatusPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null)

  async function load() {
    const { data } = await supabase.from('service_orders').select('*').eq('id', params.id).single()
    setData(data)
  }

  useEffect(() => {
    load()
    const sub = supabase
      .channel('service_orders-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_orders' }, (payload) => {
        if (payload.new.id === params.id) {
          setData(payload.new)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  if (!data) return <div className="p-4">Memuat...</div>

  return (
    <div className="max-w-sm mx-auto mt-6 p-4 border rounded-lg shadow text-sm">
      <h1 className="text-lg font-bold text-center mb-3">Status Servis</h1>
      <p><b>Nomor:</b> {data.nomor_nota}</p>
      <p><b>Nama:</b> {data.nama}</p>
      <p><b>Perangkat:</b> {data.perangkat}</p>
      <p><b>Keluhan:</b> {data.keluhan}</p>
      <p><b>Status:</b> <span className="font-semibold text-blue-600">{data.status}</span></p>
      <p><b>Tanggal:</b> {new Date(data.tanggal).toLocaleString('id-ID')}</p>

      <div className="mt-4 flex justify-center">
        <QRCode value={`https://service-app.vercel.app/status/${data.id}`} size={120}/>
      </div>
    </div>
  )
}
