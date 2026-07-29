'use client'

import { useCart } from '@/lib/cart-context'
import { Icon } from '@/components/ui/icons'
import Image from 'next/image'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  available: boolean
  image: string | null
}

const categoryFallbackIcons: Record<string, string> = {
  pollos: '🍗',
  hamburguesas: '🍔',
  tacos: '🌮',
  guarniciones: '🧆',
  bebidas: '🥤',
  postres: '🍰',
}

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, items, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-[#efe2d0] bg-[#fffcf8] shadow-[0_16px_40px_rgba(31,41,55,0.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(31,41,55,0.12)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f7efe3]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {categoryFallbackIcons[item.category] || '🍽️'}
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#374151]">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-[#111827]">{item.name}</h3>
          <span className="whitespace-nowrap text-base font-bold text-[#b45309]">${item.price.toFixed(2)}</span>
        </div>
        {item.description && (
          <p className="mb-3 line-clamp-2 text-sm text-[#6b7280]">{item.description}</p>
        )}

        <div className="border-t border-[#f2e7db] pt-3">
          {quantity > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 rounded-full bg-[#f7efe3] p-0.5">
                <button
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-white hover:text-[#b45309]"
                >
                  <Icon name="remove" size={16} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#111827]">{quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-white hover:text-[#b45309]"
                >
                  <Icon name="add" size={16} />
                </button>
              </div>
              <span className="text-sm font-semibold text-[#b45309]">${(item.price * quantity).toFixed(2)}</span>
            </div>
          ) : (
            <button
              onClick={() => addItem(item)}
              disabled={!item.available}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#b45309] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#93370d] disabled:bg-[#e5e7eb] disabled:text-[#9ca3af]"
            >
              <Icon name="add" size={16} />
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
