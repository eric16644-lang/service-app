import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // ⬅️ set di Vercel (Server-side only)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://service-app.vercel.app'
const BUCKET = 'qr'

export async function POST(req: Request) {
  try {
    const { id } = await req.json() as { id?: string }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const admin = createClient(URL, SERVICE_ROLE_KEY)
    // pastikan order ada
    const { data: order, error: errOrder } = await admin
      .from('service_orders')
      .select('id, status_qr_url')
      .eq('id', id)
      .single()
    if (errOrder || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // kalau sudah ada, langsung kembalikan (idempotent)
    if (order.status_qr_url) {
      return NextResponse.json({ ok: true, url: order.status_qr_url })
    }

    // generate PNG buffer
    const statusUrl = `${BASE_URL}/status/${id}`
    const pngBuffer = await QRCode.toBuffer(statusUrl, {
      errorCorrectionLevel: 'M', // cukup untuk cetak thermal
      margin: 1,
      width: 512,
    })

    // pastikan bucket ada (abaikan error jika sudah ada)
    await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {})

    // upload
    const path = `${id}.png`
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, pngBuffer, {
        contentType: 'image/png',
        upsert: true,
      })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // ambil public URL
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path)
    const qrUrl = pub.publicUrl

    // update DB
    const { error: updErr } = await admin
      .from('service_orders')
      .update({ status_qr_url: qrUrl })
      .eq('id', id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, url: qrUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
