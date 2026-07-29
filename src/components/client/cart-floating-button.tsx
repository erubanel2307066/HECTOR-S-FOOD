'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { Icon } from '@/components/ui/icons'
import CartSidebar from '@/components/client/cart-sidebar'

export default function CartFloatingButton() {
  const { items } = useCart()
  const [open, setOpen] = useState(false)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  if (totalItems === 0) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-[#b45309] px-5 py-3 text-white shadow-[0_16px_40px_rgba(180,83,9,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#93370d] active:scale-95"
      >
        <div className="relative">
          <Icon name="cart" size={22} />
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#b45309]">
            {totalItems}
          </span>
        </div>
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.24em] opacity-80">Mi pedido</p>
          <p className="text-sm font-bold leading-tight">${total.toFixed(2)}</p>
        </div>
      </button>

      {open && <CartSidebar onClose={() => setOpen(false)} />}
    </>
  )
}
