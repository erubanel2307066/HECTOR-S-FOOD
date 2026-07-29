import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { sanitizePhone, isValidPhone, validateLength } from '@/lib/validation'

const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled']

async function updateOrder(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, string | number | null> = {}
  if (body.status !== undefined) {
    if (!validStatuses.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    updateData.status = body.status
  }
  if (body.phone !== undefined) {
    const phone = sanitizePhone(String(body.phone))
    if (!isValidPhone(phone)) return NextResponse.json({ error: 'Teléfono inválido (10-15 dígitos)' }, { status: 400 })
    updateData.phone = phone
  }
  if (body.type !== undefined) {
    if (!['delivery', 'pickup'].includes(body.type)) return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
    updateData.type = body.type
  }
  for (const field of ['address', 'schedule'] as const) {
    if (body[field] !== undefined) {
      const val = body[field]?.trim() || null
      if (val) {
        const err = validateLength(field, val)
        if (err) return NextResponse.json({ error: err }, { status: 400 })
      }
      updateData[field] = val
    }
  }
  if (body.total !== undefined) {
    const total = Number(body.total)
    if (!Number.isFinite(total) || total < 0) return NextResponse.json({ error: 'Invalid total' }, { status: 400 })
    updateData.total = total
  }
  if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })

  try {
    const order = await prisma.order.update({ where: { id }, data: updateData })
    return NextResponse.json({
      order: {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateOrder(req, context)
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return updateOrder(req, context)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } })
      if (!order) throw new Error('NOT_FOUND')
      await tx.order.delete({ where: { id } })
      const client = await tx.client.findUnique({ where: { phone: order.phone } })
      if (client) {
        const remaining = await tx.order.findMany({
          where: { phone: order.phone }, orderBy: { createdAt: 'desc' }, select: { createdAt: true },
        })
        await tx.client.update({
          where: { id: client.id },
          data: { orders: remaining.length, lastOrder: remaining[0]?.createdAt ?? null },
        })
      }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
}
