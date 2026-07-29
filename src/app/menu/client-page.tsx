'use client'

import { useEffect, useState } from 'react'
import MenuItemCard from '@/components/client/menu-item-card'
import CartFloatingButton from '@/components/client/cart-floating-button'
import { Icon } from '@/components/ui/icons'
import { BUSINESS } from '@/lib/constants'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
  image: string | null
}

const categories = [
  { value: 'pollos', label: 'Pollos', emoji: '🍗', color: 'bg-[#fff7ed] text-[#9a2c00] border-[#f4d9b3]' },
  { value: 'hamburguesas', label: 'Hamburguesas', emoji: '🍔', color: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
  { value: 'tacos', label: 'Tacos', emoji: '🌮', color: 'bg-[#fff7ed] text-[#9a2c00] border-[#f4d9b3]' },
  { value: 'guarniciones', label: 'Guarniciones', emoji: '🧆', color: 'bg-[#ecfdf3] text-[#166534] border-[#a7f3d0]' },
  { value: 'bebidas', label: 'Bebidas', emoji: '🥤', color: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
  { value: 'postres', label: 'Postres', emoji: '🍰', color: 'bg-[#faf5ff] text-[#7c3aed] border-[#e9d5ff]' },
]

export default function ClientMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('todos')

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredItems = activeCategory === 'todos'
    ? items
    : items.filter((i) => i.category === activeCategory)

  return (
    <div>
      <div className="border-b border-[#efe2d0] bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-[#fef3c7]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-[#111827]">Menú</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {items.filter((i) => i.available).length} platos disponibles
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-[1rem] border border-[#f4d9b3] bg-[#fff7ed] px-3 py-2 text-xs text-[#9a2c00]">
            <span>👨‍🍳</span>
            <span>
              <strong>Se prepara al momento.</strong> Entrega estimada:{' '}
              <strong>hasta {BUSINESS.deliveryMax} min</strong> después de confirmar
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 border-b border-[#efe2d0] bg-[#fffcf8]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory('todos')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === 'todos'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'bg-[#f7efe3] text-[#4b5563] hover:bg-[#efe0ca]'
              }`}
            >
              <Icon name="restaurantMenu" size={16} />
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? cat.color + ' shadow-sm'
                    : 'border-[#e7dbca] bg-white text-[#4b5563] hover:bg-[#f8efe4]'
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b45309] border-t-transparent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[1.5rem] border border-[#efe2d0] bg-[#fffcf8] p-12 text-center shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7efe3]">
              <Icon name="restaurantMenu" size={32} className="text-[#d1b089]" />
            </div>
            <p className="font-medium text-[#111827]">No hay platos en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <CartFloatingButton />
    </div>
  )
}
