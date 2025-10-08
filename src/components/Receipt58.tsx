type Props = {
  nomor_nota: string
  nama: string
  perangkat: string
  keluhan: string
  tanggal: string
  status: string
  estimasi?: number
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
  status_qr_url?: string            // gambar QR (URL storage / dataURL)
  statusUrl?: string                // ← teks link status (opsional)
  no_hp?: string
  orderId?: string
}

export default function Receipt58({
  nomor_nota, nama, perangkat, keluhan, tanggal, status, estimasi,
  sim_card, sd_card, charger, box, phone_case,
  status_qr_url, statusUrl,           // ← terima di sini
  no_hp, orderId
}: Props) {
  // ... isi nota kamu

  return (
    <div className="w-[320px] bg-white text-black rounded-md shadow p-3 text-[12px] font-mono">
      {/* ...bagian atas nota... */}

      {/* QR untuk lacak status */}
      <div className="mt-2 pt-2 border-t">
        <div className="text-center font-semibold mb-2">Scan untuk lacak status:</div>
        <div className="flex justify-center">
          {status_qr_url ? (
            <img src={status_qr_url} alt="QR Status" width={128} height={128} />
          ) : (
            <div className="text-center text-xs opacity-60">QR belum tersedia</div>
          )}
        </div>
        {statusUrl && (
          <div className="text-center text-[10px] mt-1 break-all opacity-70">
            {statusUrl}
          </div>
        )}
      </div>

      {/* ...footer nota... */}
    </div>
  )
}
