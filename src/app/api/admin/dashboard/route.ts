import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!(await isAdminFromRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalOrders,
    todayOrders,
    totalCustomers,
    pendingOrders,
    menuItems,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.client.count(),
    prisma.order.count({ where: { status: { in: ['pending', 'confirmed', 'preparing'] } } }),
    prisma.menuItem.count({ where: { isActive: true } }),
  ])

  return NextResponse.json({
    totalOrders,
    todayOrders,
    totalCustomers,
    pendingOrders,
    menuItems,
  })
}
