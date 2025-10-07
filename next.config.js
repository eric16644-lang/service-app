/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ❌ Abaikan semua error/warning saat build (biar deploy lancar)
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
