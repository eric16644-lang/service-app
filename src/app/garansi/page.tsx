// /src/app/garansi/page.tsx
'use client'

import { useMemo, useState } from 'react'
import WarrantyReceipt58 from '@/components/WarrantyReceipt58'

type Form = {
  nomor_garansi: string
  tanggal_pengambilan: string
  nama: string
  no_hp: string
  perangkat: string
  perbaikan: string
  biaya: string
  masa_garansi_hari: string
  catatan_tambahan: string
}

export default function GaransiInputPage() {
  // auto nomor: GRN-YYYY-XXXXXX
  const autoNomor = useMemo(() => {
    const ts = Date.now().toString().slice(-6)
    return `GRN-${new Date().getFullYear()}-${ts}`
  }, [])

  const nowLocal = useMemo(() => {
    const d = new Date()
    // format dd/MM/yyyy, HH.mm.ss
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).replaceAll(':', '.')
  }, [])

  const [form, setForm] = useState<Form>({
    nomor_garansi: autoNomor,
    tanggal_pengambilan: nowLocal,
    nama: '',
    no_hp: '',
    perangkat: '',
    perbaikan: '',
    biaya: '',
    masa_garansi_hari: '30',
    catatan_tambahan: '',
  })

  const [showPreview, setShowPreview] = useState(false)

  function onChange<K extends keyof Form>(k: K, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  // hitung tanggal berlaku s/d
  const berlakuSampai = useMemo(() => {
    const hari = parseInt(form.masa_garansi_hari || '0', 10)
    // parse tanggal dari string tampilan sekarang → fallback ke now
    const base = new Date()
    base.setDate(base.getDate() + (isNaN(hari) ? 0 : hari))
    return base.toLocaleDateString('id-ID')
  }, [form.masa_garansi_hari])

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Input Nota Pengambilan & Garansi (Manual)</h1>
      <p className="text-sm opacity-80 mb-4">
        Form ini tidak menyimpan ke database. Isi semua kolom lalu klik <b>Tampilkan Nota</b> untuk mencetak.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Form */}
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-950 border-gray-200 dark:border-gray-800">
          <div className="grid gap-3">
            <div>
              <label className="block text-sm mb-1">No. Garansi</label>
              <input className="w-full border rounded px-3 py-2"
                     value={form.nomor_garansi}
                     onChange={e => onChange('nomor_garansi', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm mb-1">Tanggal Pengambilan</label>
              <input className="w-full border rounded px-3 py-2"
                     value={form.tanggal_pengambilan}
                     onChange={e => onChange('tanggal_pengambilan', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Nama</label>
                <input className="w-full border rounded px-3 py-2"
                       value={form.nama}
                       onChange={e => onChange('nama', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">No. HP</label>
                <input className="w-full border rounded px-3 py-2"
                       value={form.no_hp}
                       onChange={e => onChange('no_hp', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Perangkat</label>
              <input className="w-full border rounded px-3 py-2"
                     placeholder="contoh: vivo Y12s / IMEI ..."
                     value={form.perangkat}
                     onChange={e => onChange('perangkat', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm mb-1">Perbaikan / Pekerjaan</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-[80px]"
                        placeholder="contoh: ganti IC EMMC, reball, dll."
                        value={form.perbaikan}
                        onChange={e => onChange('perbaikan', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Biaya (Rp, angka)</label>
                <input className="w-full border rounded px-3 py-2"
                       inputMode="numeric"
                       placeholder="500000"
                       value={form.biaya}
                       onChange={e => onChange('biaya', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Masa Garansi (hari)</label>
                <input className="w-full border rounded px-3 py-2"
                       inputMode="numeric"
                       value={form.masa_garansi_hari}
                       onChange={e => onChange('masa_garansi_hari', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Catatan Tambahan (opsional)</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-[60px]"
                        placeholder="contoh: gores halus body kiri; LCD shadow tipis; dll."
                        value={form.catatan_tambahan}
                        onChange={e => onChange('catatan_tambahan', e.target.value)} />
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
              onClick={() => setShowPreview(true)}
            >
              Tampilkan Nota
            </button>
          </div>
        </div>

        {/* Preview Nota */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-neutral-900/40 border-gray-200 dark:border-gray-800">
          {showPreview ? (
            <WarrantyReceipt58
              nomor_garansi={form.nomor_garansi}
              tanggal_pengambilan={form.tanggal_pengambilan}
              nama={form.nama}
              no_hp={form.no_hp || undefined}
              perangkat={form.perangkat}
              perbaikan={form.perbaikan}
              biaya={form.biaya ? Number(form.biaya) : undefined}
              masa_garansi_hari={parseInt(form.masa_garansi_hari || '0', 10) || 0}
              berlaku_sampai={berlakuSampai}
              catatan_tambahan={form.catatan_tambahan || undefined}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm opacity-70">
              Preview nota akan muncul di sini setelah kamu klik <b>Tampilkan Nota</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
