import { NextRequest, NextResponse } from 'next/server'
import { syncPharmacistsNews } from '@/app/lib/sync-pharmacists'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await syncPharmacistsNews()
  return NextResponse.json({ ok: true, ...result })
}