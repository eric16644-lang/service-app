// /src/components/WarrantyReceipt58.tsx
import React from 'react'

type Props = {
  nomor_garansi: string
  tanggal_pengambilan: string
  nama: string
  no_hp?: string
  perangkat: string
  perbaikan: string
  biaya?: number
  masa_garansi_hari: number
  berlaku_sampai: string
  catatan_tambahan?: string

  // header toko (opsional)
  storeName?: string
  storePhone?: string
  storeAddress?: string
}

export default function WarrantyReceipt58({
  nomor_garansi,
  tanggal_pengambilan,
  nama,
  no_hp,
  perangkat,
  perbaikan,
  biaya,
  masa_garansi_hari,
  berlaku_sampai,
  catatan_tambahan,
  storeName = 'JP Cellular',
  storePhone = 'Telp/WA: 0882001832312',
  storeAddress = 'Jln. Ahmad Yani Jajaran Depan\nPasar Talaga Blok A No. 5',
}: Props) {
  const rupiah = (n?: number) =>
    typeof n === 'number' ? new Intl.NumberFormat('id-ID').format(n) : undefined

  return (
    <div className="w-full flex justify-center">
      <div className="w-[360px] print:w-[320px] bg-white text-black dark:bg-neutral-900 dark:text-gray-100 rounded-md shadow print:shadow-none p-3 text-[12px] font-mono">
        {/* Header */}
        <div className="text-center leading-tight">
          <div className="font-bold text-[13px]">Nota Pengambilan & Garansi</div>
          <div className="font-bold text-[13px]">{storeName}</div>
          <div className="opacity-80 whitespace-pre-line">{storePhone}</div>
          <div className="opacity-80 whitespace-pre-line">{storeAddress}</div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-400" />

        {/* Identitas */}
        <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-y-1">
          <div>No. Garansi</div>
          <div className="text-right font-semibold">{nomor_garansi}</div>

          <div>Tgl. Ambil</div>
          <div className="text-right">{tanggal_pengambilan}</div>

          <div>Nama</div>
          <div className="text-right">{nama}</div>

          <div>No. HP</div>
          <div className="text-right">{no_hp || '-'}</div>

          <div>Perangkat</div>
          <div className="text-right">{perangkat}</div>

          <div>Perbaikan</div>
          <div className="text-right whitespace-pre-wrap break-words">{perbaikan}</div>

          <div>Biaya</div>
          <div className="text-right">{typeof biaya === 'number' ? `Rp ${rupiah(biaya)}` : '-'}</div>

          <div>Masa Garansi</div>
          <div className="text-right">{masa_garansi_hari} hari</div>

          <div>Berlaku s/d</div>
          <div className="text-right font-semibold">{berlaku_sampai}</div>
        </div>

        <hr className="my-2 border-t border-dashed border-gray-400" />

        {/* Syarat & Ketentuan Garansi */}
        <div>
          <div className="font-semibold">Syarat & Ketentuan Garansi:</div>
          <ul className="list-disc ml-4 leading-tight">
            <li>Garansi hanya untuk kerusakan yang sama dengan perbaikan di atas.</li>
            <li>Garansi batal jika segel/label hilang/rusak, terkena air, jatuh, atau korosi.</li>
            <li>Data pribadi menjadi tanggung jawab pemilik; backup sebelum servis.</li>
            <li>Software/OS tidak bergaransi, kecuali tertulis lain.</li>
            <li>Garansi tidak menutup kerusakan fisik akibat penggunaan.</li>
          </ul>
          {catatan_tambahan && (
            <div className="mt-2">
              <div className="font-semibold">Catatan:</div>
              <div className="whitespace-pre-wrap break-words">{catatan_tambahan}</div>
            </div>
          )}
        </div>

        <div className="mt-3 text-center">Terima kasih 🙏</div>

        <div className="mt-3 flex justify-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded"
          >
            Cetak
          </button>
        </div>
      </div>
    </div>
  )
}
