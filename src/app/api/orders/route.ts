import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidPhone, sanitizePhone, validateLength } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateKey = `order:${ip}`
  const { allowed } = checkRateLimit(rateKey, 10, 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiados pedidos. Espera un minuto.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { customerName, phone, type, address, schedule, items } = body

    if (!customerName || !phone || !items || !items.length) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const cleanPhone = sanitizePhone(String(phone))
    if (!isValidPhone(cleanPhone)) {
      return NextResponse.json({ error: 'Teléfono inválido (10-15 dígitos)' }, { status: 400 })
    }

    const nameErr = validateLength('customerName', String(customerName))
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 })

    if (address) {
      const addrErr = validateLength('address', String(address))
      if (addrErr) return NextResponse.json({ error: addrErr }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length > 50) {
      return NextResponse.json({ error: 'Items inválidos' }, { status: 400 })
    }

    // Recalcular total en servidor
    let serverTotal = 0
    const validatedItems = []
    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: 'Item inválido' }, { status: 400 })
      }
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.id } })
      if (!menuItem || !menuItem.isActive) {
        return NextResponse.json({ error: `Ítem no disponible: ${item.name || item.id}` }, { status: 400 })
      }
      serverTotal += menuItem.price * item.quantity
      validatedItems.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: item.quantity })
    }

    const order = await prisma.order.create({
      data: {
        phone: cleanPhone,
        items: JSON.stringify(validatedItems),
        type: type === 'pickup' ? 'pickup' : 'delivery',
        address: address ? String(address).trim().slice(0, 500) : null,
        schedule: schedule ? String(schedule).slice(0, 50) : null,
        total: serverTotal,
        status: 'pending',
      },
    })

    await prisma.client.upsert({
      where: { phone: cleanPhone },
      update: { name: String(customerName).trim().slice(0, 200), orders: { increment: 1 }, lastOrder: new Date() },
      create: { phone: cleanPhone, name: String(customerName).trim().slice(0, 200), orders: 1, lastOrder: new Date() },
    })

    return NextResponse.json({ order, message: 'Pedido recibido' })
  } catch (error) {
    console.error('[Orders Error]', error)
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 })
  }
}
