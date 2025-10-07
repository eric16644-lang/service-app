'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Receipt58 from '@/components/Receipt58'

type Service = {
  id: string
  nomor_nota: string
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi: number | null
  status: string
  tanggal: string
  qris_url?: string | null
  // ✅ kelengkapan
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function NotaPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Service | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const sp = useSearchParams()
  const auto = sp.get('auto')

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', params.id)
        .single<Service>()
      if (error) setErr(error.message)
      else setOrder(data)
    })()
  }, [params.id])

  useEffect(() => {
    if (order && auto === '1') {
      const t = setTimeout(() => window.print(), 300)
      return () => clearTimeout(t)
    }
  }, [order, auto])

  if (err) return <div className="p-4 text-sm text-rose-700">Gagal memuat nota: {err}</div>
  if (!order) return <div className="p-4 text-sm">Memuat nota…</div>

  return (
    <div className="p-3 flex justify-center bg-neutral-100 min-h-[100dvh] print:bg-white">
      <Receipt58
        nomor_nota={order.nomor_nota}
        nama={order.nama}
        no_hp={order.no_hp}
        perangkat={order.perangkat}
        keluhan={order.keluhan}
        estimasi={order.estimasi}
        status={order.status}
        tanggal={order.tanggal}
        orderId={order.id}
        qris_url={order.qris_url}
        // ✅ pass kelengkapan
        sim_card={order.sim_card}
        sd_card={order.sd_card}
        charger={order.charger}
        box={order.box}
        phone_case={order.phone_case}
      />
    </div>
  )
}
