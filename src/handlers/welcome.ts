import { sendButtons, sendText } from '../lib/whatsapp'
import { prisma } from '../lib/prisma'
import { BUSINESS } from '../lib/constants'
import { sanitizePhone } from '../lib/validation'

export async function handleWelcome(rawPhone: string, name?: string) {
  const phone = sanitizePhone(rawPhone)
  await prisma.client.upsert({
    where: { phone },
    update: {},
    create: { phone, name },
  })

  await prisma.conversation.upsert({
    where: { phone },
    update: { step: 'main_menu' },
    create: { phone, step: 'main_menu' },
  })

  const greeting = name
    ? `¡Hola ${name}! Bienvenido a *Hector's* 🎉`
    : `¡Hola! Bienvenido a *Hector's* 🎉`

  await sendText(phone,
    `${greeting}\n\nSomos comida casera, rápida y deliciosa.\nTe llevamos el almuerzo a tu oficina o casa.`
  )

  await sendButtons(phone,
    '🍽 Hector\'s',
    '¿Qué deseas hacer?',
    [
      { type: 'reply', reply: { id: 'menu_today', title: '🍽 Menú del día' } },
      { type: 'reply', reply: { id: 'menu_full', title: '📋 Menú completo' } },
      { type: 'reply', reply: { id: 'info', title: 'ℹ️ Información' } },
    ]
  )
}

export async function handleMainMenu(phone: string) {
  await sendButtons(phone,
    '🍽 Hector\'s',
    '¿Qué deseas hacer?',
    [
      { type: 'reply', reply: { id: 'menu_today', title: '🍽 Menú del día' } },
      { type: 'reply', reply: { id: 'menu_full', title: '📋 Menú completo' } },
      { type: 'reply', reply: { id: 'info', title: 'ℹ️ Información' } },
    ]
  )
}

export async function handleInfo(phone: string) {
  await sendText(phone,
    `ℹ️ *Hector's - Información*\n\n` +
    `🕐 *Horarios:* ${BUSINESS.hours}\n` +
    `📍 *Zona de entrega:* Zona centro y alrededores\n` +
    `🚚 *Delivery:* $20 MXN\n` +
    `💵 *Pago:* ${BUSINESS.payment}\n\n` +
    `📱 Pedidos por WhatsApp\n` +
    `👨‍🍳 ${BUSINESS.prep}`
  )

  await sendButtons(phone,
    '🍽 Hector\'s',
    '¿Quieres ver el menú?',
    [
      { type: 'reply', reply: { id: 'menu_today', title: '🍽 Menú del día' } },
      { type: 'reply', reply: { id: 'main_menu', title: '🔙 Volver' } },
    ]
  )
}
