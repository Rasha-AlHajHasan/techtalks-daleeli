import { NextRequest, NextResponse } from 'next/server'
import { syncTripoliBarNews } from '@/app/lib/sync-tripoli-bar'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await syncTripoliBarNews()
  return NextResponse.json({ ok: true, ...result })
}