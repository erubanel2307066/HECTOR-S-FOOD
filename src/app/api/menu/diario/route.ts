import { NextResponse } from 'next/server'
import { getTodaysMenu } from '@/lib/menu'

export async function GET() {
  try {
    const items = await getTodaysMenu()
    return NextResponse.json({
      items: items.map(({ isActive, ...rest }) => ({ ...rest, available: isActive })),
    })
  } catch (error) {
    console.error('[Menu Diario Error]', error)
    return NextResponse.json({ items: [] })
  }
}
