import { supabase } from '@/lib/supabaseClient'
import QRCode from 'react-qr-code'

export default async function StatusPage({ params }: { params: { id: string } }) {
  const { data } = await supabase.from('service_orders').select('*').eq('id', params.id).single()

  if (!data) return <div className="p-4">Data tidak ditemukan</div>

  return (
    <div className="max-w-sm mx-auto mt-6 p-4 border rounded-lg shadow">
      <h1 className="text-lg font-bold text-center mb-2">Status Servis</h1>
      <div className="text-sm space-y-1">
        <p><b>Nomor:</b> {data.nomor_nota}</p>
        <p><b>Nama:</b> {data.nama}</p>
        <p><b>Perangkat:</b> {data.perangkat}</p>
        <p><b>Keluhan:</b> {data.keluhan}</p>
        <p><b>Estimasi:</b> Rp {data.estimasi}</p>
        <p><b>Status:</b> {data.status}</p>
        <p><b>Tanggal:</b> {new Date(data.tanggal).toLocaleString('id-ID')}</p>
      </div>
      <div className="mt-4 flex justify-center">
        <QRCode value={`https://service-app.vercel.app/status/${data.id}`} size={120}/>
      </div>
    </div>
  )
}
