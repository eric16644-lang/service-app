import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { phone, message } = await req.json()

  // Format nomor harus tanpa tanda + dan tanpa spasi, contoh: 6281234567890
  const url = `https://api.green-api.com/waInstance${process.env.GREENAPI_ID}/SendMessage/${process.env.GREENAPI_TOKEN}`

  const payload = {
    chatId: `${phone}@c.us`, // format chatId GreenAPI
    message
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  return NextResponse.json({ ok: true, result: data })
}
