import { promises as fs } from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { isCloudinaryConfigured, fetchMenuJson, uploadMenuJson } from './cloudinary'

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
const CACHE_TTL = 60 * 1000

let cache: { items: MenuItem[]; at: number } | null = null

async function readLocal(): Promise<MenuItem[]> {
  try {
    const raw = await fs.readFile(MENU_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeLocal(items: MenuItem[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(MENU_PATH), { recursive: true })
    await fs.writeFile(MENU_PATH, JSON.stringify(items, null, 2), 'utf-8')
  } catch (error) {
    console.error('[Menu Store] Local write error:', error)
  }
}

function isValid(data: unknown): data is MenuItem[] {
  return Array.isArray(data) && data.every((i) => i && typeof i.id === 'string' && typeof i.name === 'string')
}

export async function getMenu(): Promise<MenuItem[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return cache.items
  }

  if (isCloudinaryConfigured()) {
    const remoteText = await fetchMenuJson()
    if (remoteText) {
      try {
        const remote = JSON.parse(remoteText)
        if (isValid(remote)) {
          await writeLocal(remote)
          cache = { items: remote, at: Date.now() }
          return remote
        }
      } catch {
      }
    } else {
      const local = await readLocal()
      if (local.length > 0) {
        await uploadMenuJson(JSON.stringify(local, null, 2))
        cache = { items: local, at: Date.now() }
        return local
      }
    }
  }

  const local = await readLocal()
  cache = { items: local, at: Date.now() }
  return local
}

export async function saveMenu(items: MenuItem[]): Promise<void> {
  cache = { items, at: Date.now() }
  await writeLocal(items)
  if (isCloudinaryConfigured()) {
    const ok = await uploadMenuJson(JSON.stringify(items, null, 2))
    if (!ok) console.error('[Menu Store] No se pudo persistir menú en Cloudinary')
  }
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
