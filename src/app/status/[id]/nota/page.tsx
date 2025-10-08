'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Receipt58 from '@/components/Receipt58'
import QRCode from 'qrcode' // fallback client-side

type Order = {
  id: string
  nomor_nota: string
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi?: number | null
  status: string
  tanggal: string
  status_qr_url?: string | null
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function NotaPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [qrSrc, setQrSrc] = useState<string | null>(null)

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://service-app.vercel.app'
  const statusUrl = useMemo(
    () => `${baseUrl}/status/${params.id}`,
    [baseUrl, params.id]
  )

  // 1) Ambil order
  useEffect(() => {
    let ignore = false
    ;(async () => {
      const { data } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', params.id)
        .single()
      if (!ignore && data) setOrder(data)
    })()
    return () => {
      ignore = true
    }
  }, [params.id])

  // 2) Pastikan QR tersedia (server dulu, kalau gagal fallback client)
  useEffect(() => {
    if (!order) return // ⬅️ early return: TS tahu bawahnya tidak jalan saat null

    const o = order // ⬅️ salin ke const lokal agar narrowing tidak hilang di async

    ;(async () => {
      // a) kalau sudah ada URL di DB, pakai itu
      if (o.status_qr_url) {
        setQrSrc(o.status_qr_url)
        return
      }

      // b) coba generate via API (simpan di Storage & update DB)
      try {
        const res = await fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: o.id }),
        })
        if (res.ok) {
          const j = await res.json()
          if (j?.url) {
            setQrSrc(j.url)
            return
          }
        }
      } catch {
        // abaikan, lanjut fallback
      }

      // c) fallback terakhir: generate dataURL di client (untuk dicetak)
      try {
        const dataUrl = await QRCode.toDataURL(statusUrl, {
          width: 256,
          margin: 1,
          errorCorrectionLevel: 'M',
        })
        setQrSrc(dataUrl)
      } catch (e) {
        console.error('QR fallback failed:', e)
      }
    })()
  }, [order, statusUrl])

  // 3) Render
  if (!order) return <div className="p-4">Memuat nota…</div>

  return (
    <div className="p-4 flex justify-center">
      <Receipt58
        nomor_nota={order.nomor_nota}
        nama={order.nama}
        perangkat={order.perangkat}
        keluhan={order.keluhan}
        tanggal={order.tanggal}
        status={order.status}
        estimasi={order.estimasi ?? undefined}
        sim_card={order.sim_card}
        sd_card={order.sd_card}
        charger={order.charger}
        box={order.box}
        phone_case={order.phone_case}
        status_qr_url={qrSrc ?? undefined} // bisa URL storage atau dataURL
        statusUrl={statusUrl}
        no_hp={order.no_hp}                 // opsional di Receipt58
        orderId={order.id}                  // opsional di Receipt58
      />
    </div>
  )
}
