import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')
  const since = searchParams.get('since')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const search = searchParams.get('search') || ''

  const where: { status?: { in: string[] }; createdAt?: { gte: Date }; phone?: { contains: string } } = {}
  if (statusFilter) {
    const statuses = statusFilter.split(',')
    where.status = { in: statuses }
  }
  if (since) {
    const date = new Date(since)
    if (!Number.isNaN(date.getTime())) where.createdAt = { gte: date }
  }
  if (search) {
    where.phone = { contains: search }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  const clients = await prisma.client.findMany({
    where: { phone: { in: [...new Set(orders.map((order) => order.phone))] } },
    select: { phone: true, name: true },
  })
  const clientNames = new Map(clients.map((client) => [client.phone, client.name]))

  const parsed = orders.map((o) => ({
    ...o,
    customerName: clientNames.get(o.phone) || 'Sin nombre',
    items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
  }))

  return NextResponse.json({
    orders: parsed,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
