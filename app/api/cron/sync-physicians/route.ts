import { NextRequest, NextResponse } from 'next/server'
import { syncPhysiciansNews } from '@/app/lib/sync-physicians'

export async function GET(req: NextRequest) {
  const result = await syncPhysiciansNews()
  return NextResponse.json({ ok: true, ...result })
}