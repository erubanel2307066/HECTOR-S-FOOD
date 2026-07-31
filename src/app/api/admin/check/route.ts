import { NextRequest, NextResponse } from 'next/server'
import { isAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (await isAdminFromRequest(req)) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
