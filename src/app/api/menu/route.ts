import { NextResponse } from 'next/server'
import { getActiveMenu } from '@/lib/menu-store'

export async function GET() {
  try {
    const items = await getActiveMenu()
    const sorted = [...items].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

    return NextResponse.json({
      items: sorted.map(({ isActive, ...rest }) => ({ ...rest, available: isActive })),
    })
  } catch (error) {
    console.error('[Menu Error]', error)
    return NextResponse.json({ items: [] })
  }
}
