import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  // sementara: jangan blokir apa pun
  return NextResponse.next()
}

// (opsional) kosongkan matcher supaya tidak pernah jalan
export const config = {
  matcher: [],
}
