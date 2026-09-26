import { sendText, sendButtons } from '../lib/whatsapp'
import { formatOrderSummary, parseOrderText } from '../lib/menu'
import { getActiveMenu } from '../lib/menu-store'
import { getConversation, setConversation, clearConversation } from '../lib/conversation-store'

export async function handleStartOrder(phone: string) {
  await sendText(phone,
    '🛒 *Hacer pedido*\n\n' +
    'Escribe los códigos de los productos y la cantidad.\n\n' +
    'Ejemplo: *P1 2, H1 1*\n' +
    '→ 2 Pollos 1/4\n' +
    '→ 1 Hamburguesa\n\n' +
    'O escribe *0* para cancelar.'
  )

  setConversation(phone, 'awaiting_items')
}

export async function handleAwaitingItems(phone: string, text: string) {
  if (text === '0') {
    await sendText(phone, 'Pedido cancelado.')
    clearConversation(phone)
    return
  }

  const menuItems = await getActiveMenu()
  const parsed = parseOrderText(text, menuItems)

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

  setConversation(phone, 'awaiting_type', { selected: parsed, total })

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

export async function handleAwaitingAddress(phone: string, orderType: string) {
  const conv = getConversation(phone)
  if (!conv) return

  if (orderType === 'pickup') {
    return handleAwaitingSchedule(phone, 'pickup', '')
  }

  await sendText(phone,
    '📍 *Dirección de entrega*\n\n' +
    'Escribe tu dirección completa:\n' +
    '- Calle y número\n' +
    '- Colonia\n' +
    '- Referencia (opcional)'
  )

  setConversation(phone, 'awaiting_address', { ...conv.data, type: 'delivery' })
}

export async function handleAddressReceived(phone: string, address: string) {
  const conv = getConversation(phone)
  if (!conv) return

  await sendText(phone,
    `✅ Dirección guardada:\n_${address}_\n\n` +
    '🕐 *¿A qué hora quieres que llegue tu pedido?*\n\n' +
    'Escribe la hora (ej: *1:00 PM* o *13:00*)'
  )

  setConversation(phone, 'awaiting_schedule', { ...conv.data, address })
}

export async function handleAwaitingSchedule(phone: string, type: string, address: string) {
  const conv = getConversation(phone)
  if (!conv) return

  await sendText(phone,
    '🕐 *¿A qué hora quieres que llegue tu pedido?*\n\n' +
    'Escribe la hora (ej: *1:00 PM* o *13:00*)'
  )

  setConversation(phone, 'awaiting_schedule', { ...conv.data, type, address })
}

export async function handleScheduleReceived(phone: string, schedule: string) {
  const conv = getConversation(phone)
  if (!conv) return

  const data = conv.data as { selected: { name: string; qty: number; price: number }[]; total: number; type?: string; address?: string }
  const typeLabel = data.type === 'delivery' ? '🚚 A domicilio' : '🚶 Para llevar'
  const addressText = data.address ? `\n📍 ${data.address}` : ''

  const itemsText = data.selected.map((i) => `${i.qty}x ${i.name} - $${(i.qty * i.price).toFixed(2)}`).join('\n')

  await sendText(phone,
    `✅ *¡PEDIDO CONFIRMADO!*\n\n` +
    `${itemsText}\n\n` +
    `────────────────\n` +
    `${typeLabel}${addressText}\n` +
    `🕐 ${schedule}\n` +
    `💰 Total: $${data.total.toFixed(2)} MXN\n\n` +
    `💵 *Pago:* Efectivo contra entrega\n\n` +
    `Te notificaremos cuando tu pedido esté listo 📲`
  )

  clearConversation(phone)
}

export async function handleCancelOrder(phone: string) {
  await sendText(phone, '❌ Pedido cancelado. ¡Esperamos tu próximo pedido!')
  clearConversation(phone)
}
