'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type FormState = {
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi: string // input text, nanti diparse ke number
  // ✅ checklist kelengkapan
  sim_card: boolean
  sd_card: boolean
  charger: boolean
  box: boolean
  phone_case: boolean
}

export default function InputServicePage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    nama: '',
    no_hp: '',
    perangkat: '',
    keluhan: '',
    estimasi: '',
    sim_card: false,
    sd_card: false,
    charger: false,
    box: false,
    phone_case: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // nomor nota unik: SRV-YYYY-XXXXXX (6 digit terakhir timestamp)
  const nomorNota = useMemo(() => {
    const ts = Date.now().toString().slice(-6)
    return `SRV-${new Date().getFullYear()}-${ts}`
  }, [])

  const onChange = useCallback(
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =
          e.currentTarget.type === 'checkbox'
            ? (e as React.ChangeEvent<HTMLInputElement>).target.checked
            : e.currentTarget.value
        setForm((prev) => ({ ...prev, [key]: value as any }))
      },
    []
  )

  function validate(): string | null {
    if (!form.nama.trim()) return 'Nama wajib diisi'
    if (!form.no_hp.trim()) return 'Nomor HP wajib diisi'
    // format nomor WA/HP internasional tanpa "+" (ex: 628xxxxxxxx)
    if (!/^62\d{7,15}$/.test(form.no_hp.trim())) {
      return 'Nomor HP harus format internasional tanpa "+", misal 62812xxxxxxx'
    }
    if (!form.perangkat.trim()) return 'Perangkat wajib diisi'
    if (!form.keluhan.trim()) return 'Keluhan wajib diisi'
    if (form.estimasi && isNaN(Number(form.estimasi))) {
      return 'Estimasi harus angka (tanpa titik/koma)'
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    const v = validate()
    if (v) {
      setErrorMsg(v)
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        nomor_nota: nomorNota,
        nama: form.nama.trim(),
        no_hp: form.no_hp.trim(),
        perangkat: form.perangkat.trim(),
        keluhan: form.keluhan.trim(),
        estimasi: form.estimasi ? Number(form.estimasi) : null,
        // ✅ simpan checklist
        sim_card: form.sim_card,
        sd_card: form.sd_card,
        charger: form.charger,
        box: form.box,
        phone_case: form.phone_case,
        // status TIDAK dikirim → biar pakai default DB: 'checking'
      }

      const { data, error } = await supabase
        .from('service_orders')
        .insert([payload])
        .select('*')
        .single()

      if (error) throw error
      // redirect ke halaman status untuk dicetak / dibagikan
      router.push(`/status/${data.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // 🔳 Komponen kecil untuk checkbox rapi (klik label = toggle)
  function CheckItem({
    label,
    checked,
    onChange,
    id,
  }: {
    label: string
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    id: string
  }) {
    return (
      <label
        htmlFor={id}
        className={`flex items-center gap-2 px-3 py-2 border rounded cursor-pointer select-none ${
          checked ? 'bg-blue-50 border-blue-400' : 'bg-white'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4"
          checked={checked}
          onChange={onChange}
        />
        <span>{label}</span>
      </label>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Input Servis Baru</h1>

      <div className="text-sm mb-4">
        <div>
          <span className="opacity-70">Nomor Nota:</span>{' '}
          <b>{nomorNota}</b>
        </div>
        <div>
          <span className="opacity-70">Status awal:</span>{' '}
          <b className="text-yellow-700">checking</b>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-3 rounded border border-rose-300 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm mb-1">Nama</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nama pelanggan"
            value={form.nama}
            onChange={onChange('nama')}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nomor HP (format 62…)</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="62812xxxxxxx"
            value={form.no_hp}
            onChange={onChange('no_hp')}
            inputMode="numeric"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Perangkat</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Contoh: Samsung A55"
            value={form.perangkat}
            onChange={onChange('perangkat')}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Keluhan</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[80px]"
            placeholder="Contoh: tidak bisa nyala, kemasukan air, dll."
            value={form.keluhan}
            onChange={onChange('keluhan')}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Estimasi (Rp, angka saja)</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="250000"
            value={form.estimasi}
            onChange={onChange('estimasi')}
            inputMode="numeric"
          />
        </div>

        {/* ✅ Kelengkapan (ceklist) */}
        <div className="mt-2">
          <div className="block text-sm mb-2 font-medium">Kelengkapan (cek yang diterima)</div>
          <div className="grid grid-cols-2 gap-2">
            <CheckItem
              id="sim_card"
              label="SIM Card"
              checked={form.sim_card}
              onChange={onChange('sim_card') as any}
            />
            <CheckItem
              id="sd_card"
              label="SD Card"
              checked={form.sd_card}
              onChange={onChange('sd_card') as any}
            />
            <CheckItem
              id="charger"
              label="Charger"
              checked={form.charger}
              onChange={onChange('charger') as any}
            />
            <CheckItem
              id="box"
              label="Box"
              checked={form.box}
              onChange={onChange('box') as any}
            />
            <CheckItem
              id="phone_case"
              label="Case"
              checked={form.phone_case}
              onChange={onChange('phone_case') as any}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`bg-blue-600 text-white py-2 rounded font-medium ${
            submitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Menyimpan…' : 'Simpan & Lihat Nota / Status'}
        </button>
      </form>

      <p className="text-xs opacity-70 mt-3">
        Tips: setelah tersimpan, halaman akan berpindah ke status order. Dari sana kamu bisa cetak / kirim link ke pelanggan.
      </p>
    </div>
  )
}
