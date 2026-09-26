import { NextResponse } from 'next/server'
import { getActiveMenu } from '@/lib/menu-store'

export async function GET() {
  try {
    const items = await getActiveMenu()
    return NextResponse.json({
      items: items.map(({ isActive, ...rest }) => ({ ...rest, available: isActive })),
    })
  } catch (error) {
    console.error('[Menu Diario Error]', error)
    return NextResponse.json({ items: [] })
  }
}
