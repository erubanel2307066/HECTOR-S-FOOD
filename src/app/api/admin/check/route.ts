import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  if (await isAdmin()) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
