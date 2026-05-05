import { NextRequest, NextResponse } from 'next/server'
import { syncTripoliBarNews } from '@/app/lib/sync-tripoli-bar'

export async function GET(req: NextRequest) {
  const result = await syncTripoliBarNews()
  return NextResponse.json({ ok: true, ...result })
}