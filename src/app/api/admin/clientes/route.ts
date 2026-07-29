import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const search = searchParams.get('search') || ''

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { orders: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ])

  return NextResponse.json({
    clients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
