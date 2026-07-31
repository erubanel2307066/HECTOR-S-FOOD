import { prisma } from './prisma'
import type { MenuItem } from '../generated/prisma/client'

export function formatMenuText(items: MenuItem[], title = 'MENÚ DEL DÍA'): string {
  if (items.length === 0) return '🍽 Hoy no hay menú disponible.'

  const categorized = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  let text = `🍽 *${title.toUpperCase()}*\n\n`

  for (const [category, categoryItems] of Object.entries(categorized)) {
    text += `*${category.toUpperCase()}*\n`
    text += '─'.repeat(20) + '\n'
    for (const item of categoryItems) {
      text += `🔸 *${item.code}* - ${item.name}\n`
      if (item.description) text += `   ${item.description}\n`
      text += `   $${item.price.toFixed(2)} MXN\n\n`
    }
  }

  text += '─'.repeat(20) + '\n'
  text += '📝 *Para ordenar:* Escribe el código y la cantidad\n'
  text += 'Ej: *P1 2, H1 1* (2 Pollos 1/4 y 1 Hamburguesa)\n\n'
  text += 'También puedes elegir una opción:'

  return text
}

export function formatOrderSummary(items: { name: string; qty: number; price: number }[]): string {
  let text = '📋 *RESUMEN DE TU PEDIDO*\n\n'
  let total = 0

  for (const item of items) {
    const subtotal = item.qty * item.price
    total += subtotal
    text += `${item.qty}x ${item.name} - $${subtotal.toFixed(2)}\n`
  }

  text += '\n' + '─'.repeat(20) + '\n'
  text += `*Total: $${total.toFixed(2)} MXN*\n`
  text += '\n¿A domicilio o para llevar?'

  return text
}

export function parseOrderText(text: string, menuItems: MenuItem[]): { name: string; qty: number; price: number }[] | null {
  const codePattern = /([A-Za-z]+\d+)\s*(\d+)/g
  const items: { name: string; qty: number; price: number }[] = []
  let match: RegExpExecArray | null

  while ((match = codePattern.exec(text)) !== null) {
    const code = match[1].toUpperCase()
    const qty = parseInt(match[2], 10)
    const menuItem = menuItems.find((m) => m.code === code && m.isActive)

    if (menuItem && qty > 0) {
      items.push({ name: menuItem.name, qty, price: menuItem.price })
    }
  }

  return items.length > 0 ? items : null
}

export async function getTodaysMenu() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dailyMenu = await prisma.dailyMenu.findUnique({
    where: { date: today },
  })

  if (dailyMenu?.active) {
    const ids = dailyMenu.items.split(',').map((id) => id.trim())
    const items = await prisma.menuItem.findMany({
      where: { id: { in: ids }, isActive: true },
    })
    if (items.length > 0) return items
  }

  return prisma.menuItem.findMany({ where: { isActive: true } })
}
