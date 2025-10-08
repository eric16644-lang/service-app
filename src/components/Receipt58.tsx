// /src/components/Receipt58.tsx
import React from 'react'

type Props = {
  // data wajib
  nomor_nota: string
  nama: string
  perangkat: string
  keluhan: string
  tanggal: string
  status: string

  // data opsional
  estimasi?: number
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean

  // QR & link tracking
  status_qr_url?: string        // URL gambar QR (storage/dataURL). Jika kosong → tampil teks fallback
  statusUrl?: string            // teks link status (ditampilkan kecil di bawah QR)

  // info tambahan (opsional, kalau mau ditampilkan atau dipakai nanti)
  no_hp?: string
  orderId?: string

  // header toko (opsional, ada default)
  storeName?: string
  storePhone?: string
  storeAddress?: string
}

export default function Receipt58({
  nomor_nota,
  nama,
  perangkat,
  keluhan,
  tanggal,
  status,
  estimasi,
  sim_card,
  sd_card,
  charger,
  box,
  phone_case,
  status_qr_url,
  statusUrl,
  // optional
  no_hp,
  orderId,
  storeName = 'JP Cellular',
  storePhone = 'Telp/WA: 0882001832312',
  storeAddress = 'Jln. Ahmad Yani Jajaran Depan\nPasar Talaga Blok A No. 5',
}: Props) {
  const kelengkapanList = [
    sim_card ? 'SIM' : null,
    sd_card ? 'SD' : null,
    charger ? 'Charger' : null,
    box ? 'Box' : null,
    phone_case ? 'Case' : null,
  ].filter(Boolean) as string[]

  const rupiah = (n?: number) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('id-ID').format(n)
      : undefined

  return (
    <div className="w-full flex justify-center">
      <div
        className="
          w-[360px] print:w-[320px]
          bg-white text-black dark:bg-neutral-900 dark:text-gray-100
          rounded-md shadow print:shadow-none
          p-3 text-[12px] font-mono
        "
      >
        {/* ===== HEADER TOKO ===== */}
        <div className="text-center leading-tight">
          <div className="font-bold text-[13px]">{storeName}</div>
          <div className="opacity-80 whitespace-pre-line">{storePhone}</div>
          <div className="opacity-80 whitespace-pre-line">{storeAddress}</div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-400" />

        {/* ===== INFO UTAMA ===== */}
        <div className="grid grid-cols-[95px_minmax(0,1fr)] gap-y-1">
          <div>No. Nota</div>
          <div className="text-right font-semibold">{nomor_nota}</div>

          <div>Tanggal</div>
          <div className="text-right">{tanggal}</div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-400" />

        <div className="grid grid-cols-[95px_minmax(0,1fr)] gap-y-1">
          <div>Nama</div>
          <div className="text-right">{nama}</div>

          <div>No. HP</div>
          <div className="text-right">{no_hp || '-'}</div>

          <div>Perangkat</div>
          <div className="text-right">{perangkat}</div>
        </div>

        <div className="mt-2">
          <div className="font-semibold">Keluhan:</div>
          <div className="whitespace-pre-wrap break-words">{keluhan}</div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-400" />

        <div className="grid grid-cols-[95px_minmax(0,1fr)] gap-y-1">
          <div>Estimasi</div>
          <div className="text-right">
            {typeof estimasi === 'number' ? `Rp ${rupiah(estimasi)}` : '-'}
          </div>

          <div>Status</div>
          <div className="text-right font-bold tracking-widest">
            {status?.toUpperCase()}
          </div>
        </div>

        {kelengkapanList.length > 0 && (
          <>
            <hr className="my-2 border-t border-dashed border-gray-400" />
            <div className="grid grid-cols-[95px_minmax(0,1fr)] gap-y-1">
              <div>Kelengkapan</div>
              <div className="text-right">{kelengkapanList.join(', ')}</div>
            </div>
          </>
        )}

        {/* ===== QR TRACKING ===== */}
        <div className="mt-3 pt-2 border-t border-dashed border-gray-400">
          <div className="text-center font-semibold mb-2">
            Scan untuk lacak status:
          </div>

          <div className="flex justify-center">
            {status_qr_url ? (
              // <Image> boleh, tapi <img> akurat untuk thermal & simpel
              <img
                src={status_qr_url}
                alt="QR Status"
                width={140}
                height={140}
                className="rounded"
              />
            ) : (
              <div className="text-xs opacity-60">QR belum tersedia</div>
            )}
          </div>

          {statusUrl && (
            <div className="text-center text-[10px] mt-1 break-all opacity-70">
              {statusUrl}
            </div>
          )}
        </div>

        {/* ===== CATATAN ===== */}
        <div className="mt-3">
          <div className="font-semibold">Catatan:</div>
          <ul className="list-disc ml-4 leading-tight">
            <li>Barang yang ditinggal lebih dari 30 hari dianggap ditarik.</li>
            <li>Mohon simpan nota ini untuk pengambilan.</li>
          </ul>
        </div>

        <div className="mt-3 text-center">Terima kasih 🙏</div>

        {/* ===== TOMBOL CETAK (disembunyikan saat print) ===== */}
        <div className="mt-3 flex justify-center print:hidden">
          <button
            className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded"
            onClick={() => window.print()}
          >
            Cetak
          </button>
        </div>
      </div>
    </div>
  )
}
