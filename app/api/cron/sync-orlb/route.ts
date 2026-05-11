import { NextRequest, NextResponse } from 'next/server'
import { syncORLBNews } from '@/app/lib/sync-orlb'

export async function GET(req: NextRequest) {
  const result = await syncORLBNews()
  return NextResponse.json({ ok: true, ...result })
}