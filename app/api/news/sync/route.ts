import { NextRequest, NextResponse } from 'next/server'
import { syncOEANews } from '@/app/lib/sync-oea'

// Test: curl -H "x-cron-secret: adskjsfsfwoafskjkseowefskjdfIAShbkdjfsodipfhsdkvsbdiosildgbs" http://localhost:3000/api/news/sync
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncOEANews()
  return NextResponse.json({ ok: true, ...result })
}
