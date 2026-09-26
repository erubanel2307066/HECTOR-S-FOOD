import { NextRequest, NextResponse } from 'next/server'
import { getMenu } from '@/lib/menu-store'
import { isAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!(await isAdminFromRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const all = await getMenu()
  const active = all.filter((i) => i.isActive)

  return NextResponse.json({
    totalOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    menuItems: active.length,
    totalMenuItems: all.length,
  })
}
