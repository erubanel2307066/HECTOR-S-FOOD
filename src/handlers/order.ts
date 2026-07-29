import { sendText, sendButtons } from '../lib/whatsapp'
import { formatOrderSummary, parseOrderText } from '../lib/menu'
import { prisma } from '../lib/prisma'
import type { MenuItem } from '../generated/prisma/client'

export async function handleStartOrder(phone: string, data: { items: MenuItem[] }) {
  await sendText(phone,
    '🛒 *Hacer pedido*\n\n' +
    'Escribe los códigos de los productos y la cantidad.\n\n' +
    'Ejemplo: *P1 2, H1 1*\n' +
    '→ 2 Pollos 1/4\n' +
    '→ 1 Hamburguesa\n\n' +
    'O escribe *0* para cancelar.'
  )

  await prisma.conversation.upsert({
    where: { phone },
    update: { step: 'awaiting_items', data: JSON.stringify({ items: data.items }) },
    create: { phone, step: 'awaiting_items', data: JSON.stringify({ items: data.items }) },
  })
}

export async function handleAwaitingItems(phone: string, text: string, data: { items: MenuItem[] }) {
  if (text === '0') {
    await sendText(phone, 'Pedido cancelado.')
    await prisma.conversation.update({
      where: { phone },
      data: { step: 'main_menu' },
    })
    return
  }

  const parsed = parseOrderText(text, data.items)

  if (!parsed) {
    await sendText(phone,
      '❌ No reconocí esos códigos.\n\n' +
      'Usa el formato: *CÓDIGO CANTIDAD*\n' +
      'Ej: *P1 2, H1 1*\n\n' +
      'Presiona "Menú" para ver los códigos disponibles.'
    )
    return
  }

  const total = parsed.reduce((sum, item) => sum + item.qty * item.price, 0)

  await sendText(phone, formatOrderSummary(parsed))

  await prisma.conversation.update({
    where: { phone },
    data: {
      step: 'awaiting_type',
      data: JSON.stringify({ items: data.items, selected: parsed, total }),
    },
  })

  await sendButtons(phone,
    '🚚 Tipo de entrega',
    `Total: $${total.toFixed(2)} MXN`,
    [
      { type: 'reply', reply: { id: 'type_delivery', title: '🚚 A domicilio' } },
      { type: 'reply', reply: { id: 'type_pickup', title: '🚶 Para llevar' } },
      { type: 'reply', reply: { id: 'cancel_order', title: '❌ Cancelar' } },
    ]
  )
}

export async function handleAwaitingAddress(phone: string, orderType: string, data: any) {
  if (orderType === 'pickup') {
    return handleAwaitingSchedule(phone, 'pickup', '', data)
  }

  await sendText(phone,
    '📍 *Dirección de entrega*\n\n' +
    'Escribe tu dirección completa:\n' +
    '- Calle y número\n' +
    '- Colonia\n' +
    '- Referencia (opcional)'
  )

  await prisma.conversation.update({
    where: { phone },
    data: {
      step: 'awaiting_address',
      data: JSON.stringify({ ...data, type: 'delivery' }),
    },
  })
}

export async function handleAddressReceived(phone: string, address: string, data: any) {
  await sendText(phone,
    `✅ Dirección guardada:\n_${address}_\n\n` +
    '🕐 *¿A qué hora quieres que llegue tu pedido?*\n\n' +
    'Escribe la hora (ej: *1:00 PM* o *13:00*)'
  )

  await prisma.conversation.update({
    where: { phone },
    data: {
      step: 'awaiting_schedule',
      data: JSON.stringify({ ...data, address }),
    },
  })
}

export async function handleAwaitingSchedule(phone: string, type: string, address: string, data: any) {
  await sendText(phone,
    '🕐 *¿A qué hora quieres que llegue tu pedido?*\n\n' +
    'Escribe la hora (ej: *1:00 PM* o *13:00*)'
  )

  await prisma.conversation.update({
    where: { phone },
    data: {
      step: 'awaiting_schedule',
      data: JSON.stringify({ ...data, type, address }),
    },
  })
}

export async function handleScheduleReceived(phone: string, schedule: string, data: any) {
  const order = await prisma.order.create({
    data: {
      phone,
      items: JSON.stringify(data.selected),
      type: data.type || 'delivery',
      address: data.address || null,
      schedule,
      total: data.total,
      status: 'pending',
    },
  })

  const typeLabel = data.type === 'delivery' ? '🚚 A domicilio' : '🚶 Para llevar'
  const addressText = data.address ? `\n📍 ${data.address}` : ''

  await sendText(phone,
    `✅ *¡PEDIDO CONFIRMADO!*\n\n` +
    `📋 *Pedido #${order.id.slice(-4).toUpperCase()}*\n` +
    `${typeLabel}${addressText}\n` +
    `🕐 ${schedule}\n` +
    `💰 Total: $${data.total.toFixed(2)} MXN\n\n` +
    `💵 *Pago:* Efectivo contra entrega\n\n` +
    `Te notificaremos cuando tu pedido esté listo 📲`
  )

  await prisma.client.update({
    where: { phone },
    data: {
      orders: { increment: 1 },
      lastOrder: new Date(),
    },
  })

  await prisma.conversation.update({
    where: { phone },
    data: { step: 'main_menu' },
  })
}

export async function handleCancelOrder(phone: string) {
  await sendText(phone, '❌ Pedido cancelado. ¡Esperamos tu próximo pedido!')
  await prisma.conversation.update({
    where: { phone },
    data: { step: 'main_menu' },
  })
}
