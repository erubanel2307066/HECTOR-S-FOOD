import { sendButtons, sendText } from '../lib/whatsapp'
import { formatMenuText, getTodaysMenu } from '../lib/menu'
import { getActiveMenu } from '../lib/menu-store'

export async function handleMenuToday(phone: string) {
  const items = await getTodaysMenu()

  if (items.length === 0) {
    await sendText(phone, '🍽 Hoy no hay menú disponible. Vuelve a consultar más tarde.')
    return
  }

  const menuText = formatMenuText(items, 'MENÚ DEL DÍA')
  await sendText(phone, menuText)

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
  const items = await getActiveMenu()
  const menuText = formatMenuText(items, 'MENÚ COMPLETO')

  await sendText(phone, menuText)

  await sendButtons(phone,
    '🛒 ¿Cómo deseas ordenar?',
    'Escribe los códigos con cantidad o presiona el botón',
    [
      { type: 'reply', reply: { id: 'start_order', title: '🛒 Hacer pedido' } },
      { type: 'reply', reply: { id: 'main_menu', title: '🔙 Volver' } },
    ]
  )
}
