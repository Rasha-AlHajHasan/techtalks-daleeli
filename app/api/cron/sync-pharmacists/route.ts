import { NextRequest, NextResponse } from 'next/server'
import { syncPharmacistsNews } from '@/app/lib/sync-pharmacists'

export async function GET(req: NextRequest) {
  const result = await syncPharmacistsNews()
  return NextResponse.json({ ok: true, ...result })
}