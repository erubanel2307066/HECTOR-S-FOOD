import { promises as fs } from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export interface MenuItem {
  id: string
  code: string
  name: string
  description: string | null
  price: number
  category: string
  image: string | null
  isActive: boolean
}

const MENU_PATH = path.join(process.cwd(), 'data', 'menu.json')

export async function getMenu(): Promise<MenuItem[]> {
  try {
    const raw = await fs.readFile(MENU_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function saveMenu(items: MenuItem[]): Promise<void> {
  await fs.mkdir(path.dirname(MENU_PATH), { recursive: true })
  await fs.writeFile(MENU_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export async function getActiveMenu(): Promise<MenuItem[]> {
  const items = await getMenu()
  return items.filter((i) => i.isActive)
}

export async function addMenuItem(data: Omit<MenuItem, 'id' | 'code'>): Promise<MenuItem> {
  const items = await getMenu()
  const id = `item-${randomBytes(8).toString('hex')}`
  const code = `M${Date.now().toString(36).toUpperCase()}`
  const item: MenuItem = { ...data, id, code }
  items.push(item)
  await saveMenu(items)
  return item
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem | null> {
  const items = await getMenu()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...data, id: items[idx].id, code: items[idx].code }
  await saveMenu(items)
  return items[idx]
}

export async function deleteMenuItem(id: string): Promise<MenuItem | null> {
  const items = await getMenu()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const [removed] = items.splice(idx, 1)
  await saveMenu(items)
  return removed
}
