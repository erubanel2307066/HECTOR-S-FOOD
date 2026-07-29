import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({
      items: items.map(({ isActive, ...rest }) => ({ ...rest, available: isActive })),
    })
  } catch (error) {
    console.error('[Menu Error]', error)
    return NextResponse.json({ items: [] })
  }
}
