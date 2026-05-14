import { NextRequest, NextResponse } from 'next/server'
import { syncBBANews } from '@/app/lib/sync-bba'

export async function GET(req: NextRequest) {
 /* const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }*/

  const result = await syncBBANews()
  return NextResponse.json({ ok: true, ...result })
}