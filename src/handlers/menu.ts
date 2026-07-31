import { sendButtons, sendText } from '../lib/whatsapp'
import { formatMenuText, getTodaysMenu } from '../lib/menu'
import { prisma } from '../lib/prisma'

export async function handleMenuToday(phone: string) {
  const items = await getTodaysMenu()

  if (items.length === 0) {
    await sendText(phone, '🍽 Hoy no hay menú disponible. Vuelve a consultar más tarde.')
    return
  }

  const menuText = formatMenuText(items, 'MENÚ DEL DÍA')
  await sendText(phone, menuText)

  await prisma.conversation.upsert({
    where: { phone },
    update: { step: 'ordering', data: JSON.stringify({ items }) },
    create: { phone, step: 'ordering', data: JSON.stringify({ items }) },
  })

  await sendButtons(phone,
    '🛒 ¿Cómo deseas ordenar?',
    'Escribe los códigos con cantidad o presiona el botón',
    [
      { type: 'reply', reply: { id: 'start_order', title: '🛒 Hacer pedido' } },
      { type: 'reply', reply: { id: 'main_menu', title: '🔙 Volver' } },
    ]
  )
}

export async function handleMenuFull(phone: string) {
  const items = await prisma.menuItem.findMany({ where: { isActive: true } })
  const menuText = formatMenuText(items, 'MENÚ COMPLETO')

  await sendText(phone, menuText)

  await prisma.conversation.upsert({
    where: { phone },
    update: { step: 'ordering', data: JSON.stringify({ items }) },
    create: { phone, step: 'ordering', data: JSON.stringify({ items }) },
  })

  await sendButtons(phone,
    '🛒 ¿Cómo deseas ordenar?',
    'Escribe los códigos con cantidad o presiona el botón',
    [
      { type: 'reply', reply: { id: 'start_order', title: '🛒 Hacer pedido' } },
      { type: 'reply', reply: { id: 'main_menu', title: '🔙 Volver' } },
    ]
  )
}
