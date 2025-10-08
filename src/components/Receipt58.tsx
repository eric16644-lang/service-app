'use client'

import QRCode from 'react-qr-code'

type Props = {
  nomor_nota: string
  nama: string
  no_hp: string
  perangkat: string
  keluhan: string
  estimasi?: number | null
  status: string
  tanggal: string | Date
  orderId: string
  status_qr_url?: string | null
  qris_url?: string | null
  // ✅ kelengkapan
  sim_card?: boolean
  sd_card?: boolean
  charger?: boolean
  box?: boolean
  phone_case?: boolean
}

export default function Receipt58({
  nomor_nota, nama, no_hp, perangkat, keluhan,
  estimasi, status, tanggal, orderId, qris_url,
  sim_card, sd_card, charger, box, phone_case
}: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://service-app.vercel.app'
  const statusUrl = `${baseUrl}/status/${orderId}`

  const fmtRp = (n?: number | null) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
      : '-'

  // ✅ gabungkan hanya yang tercentang
  const kelengkapan = [
    sim_card ? 'SIM Card' : null,
    sd_card ? 'SD Card' : null,
    charger ? 'Charger' : null,
    box ? 'Box' : null,
    phone_case ? 'Case' : null,
  ].filter(Boolean).join(' • ')

  return (
    <div className="receipt-58">
      {/* Header */}
      <div className="center">
        <div className="brand">JP Cellular</div>
        <div className="sub">Service & Jual Beli HP</div>
        <div className="sub">Telp/WA: 0882001382312</div>
        <div className="sub">Jln. Ahmad Yani Jajaran Depan Pasar Talaga Blok A No. 5</div>
      </div>

      <div className="divider" />

      {/* Info Nota */}
      <div className="row">
        <span>No. Nota</span>
        <span>{nomor_nota}</span>
      </div>
      <div className="row">
        <span>Tanggal</span>
        <span>{new Date(tanggal).toLocaleString('id-ID')}</span>
      </div>

      <div className="divider dotted" />

      {/* Pelanggan */}
      <div className="row">
        <span>Nama</span>
        <span>{nama}</span>
      </div>
      <div className="row">
        <span>No. HP</span>
        <span>{no_hp}</span>
      </div>
      <div className="row">
        <span>Perangkat</span>
        <span>{perangkat}</span>
      </div>

      {/* ✅ Kelengkapan (hanya tampil bila ada yang tercentang) */}
      {kelengkapan && (
        <div className="row">
          <span>Kelengkapan</span>
          <span style={{ maxWidth: '32mm', textAlign: 'right', overflowWrap: 'anywhere' }}>
            {kelengkapan}
          </span>
        </div>
      )}

      <div className="block">
        <div className="label">Keluhan:</div>
        <div className="multiline">{keluhan}</div>
      </div>

      <div className="divider dotted" />

      {/* Estimasi & Status */}
      <div className="row">
        <span>Estimasi</span>
        <span>{fmtRp(estimasi ?? undefined)}</span>
      </div>
      <div className="row">
        <span>Status</span>
        <span className="status">{status.toUpperCase()}</span>
      </div>

      <div className="divider" />

      {/* QR Lacak Status */}
      <div className="center">
  <div className="label center">Scan untuk lacak status:</div>
  <div className="qr-wrap">
    {/** PRIORITAS: gambar dari storage jika ada */}
    { (statusUrl as any) && null /* no-op to satisfy ts in snippet */ }
  </div>
</div>

      {/* QRIS opsional */}
      {qris_url ? (
        <>
          <div className="divider dotted" />
          <div className="center">
            <div className="label center">QRIS Pembayaran</div>
            <img src={qris_url} alt="QRIS" className="qris" />
          </div>
        </>
      ) : null}

      <div className="divider" />

      {/* Catatan & TTD */}
      <div className="block">
        <div className="label">Catatan:</div>
        <div className="tiny">
          - Barang yang ditinggal lebih dari 30 hari dianggap ditarik.<br />
          - Mohon simpan nota ini untuk pengambilan.
        </div>
      </div>

      <div className="footer center">Terima kasih 🙏</div>

      {/* Tombol Cetak (disembunyikan saat print) */}
      <div className="actions no-print">
        <button onClick={() => window.print()} className="btn">Cetak</button>
      </div>

      {/* Styles */}
      <style jsx>{`
        .receipt-58 {
          width: 58mm;
          max-width: 58mm;
          padding: 6px 6px 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px;
          color: #111;
          background: #fff;
        }
        .center { text-align: center; }
        .brand { font-weight: 800; font-size: 14px; letter-spacing: 0.5px; }
        .sub { opacity: 0.8; }
        .divider { border-top: 1px solid #111; margin: 6px 0; }
        .divider.dotted { border-top: 1px dotted #111; }
        .row {
          display: flex; justify-content: space-between;
          gap: 8px; line-height: 1.3;
        }
        .block { margin: 6px 0; }
        .label { font-weight: 700; }
        .multiline { white-space: pre-wrap; }
        .status { font-weight: 800; }
        .qr-wrap { display: inline-block; padding: 4px; }
        .tiny { font-size: 10px; opacity: 0.9; word-break: break-all; }
        .qris { width: 140px; height: 140px; object-fit: contain; }
        .footer { margin: 8px 0 6px; }
        .actions { display: flex; justify-content: center; padding: 8px 0 10px; }
        .btn {
          background: #111; color: #fff; border: 0; border-radius: 4px;
          padding: 6px 10px; font-weight: 700; cursor: pointer;
        }
        @media print {
          @page { size: 58mm auto; margin: 0; }
          :global(body) { background: #fff !important; }
          .no-print { display: none !important; }
          .receipt-58 { padding: 0 6px; }
        }
      `}</style>
    </div>
  )
}
