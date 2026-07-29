import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

export async function GET() {
  if (!(await isAdmin())) {
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
