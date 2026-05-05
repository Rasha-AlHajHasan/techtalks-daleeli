import { NextRequest, NextResponse } from 'next/server'
import { syncBBANews } from '@/app/lib/sync-bba'

export async function GET(req: NextRequest) {
  const result = await syncBBANews()
  return NextResponse.json({ ok: true, ...result })
}