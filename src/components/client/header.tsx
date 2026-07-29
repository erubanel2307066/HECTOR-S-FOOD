'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { Icon } from '@/components/ui/icons'

export default function Header() {
  const { items } = useCart()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <header className="sticky top-0 z-40 border-b border-[#edd9c0] bg-[#fffaf3]/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(120,75,20,0.06)]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b45309] shadow-[0_10px_24px_rgba(180,83,9,0.24)]">
            <Icon name="store" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none text-[#1f2937]">Hector&apos;s</h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-[#8a7057]">Comida como en casa</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link href="/" className="rounded-full px-3 py-2 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f8efe4] hover:text-[#b45309]">
            Inicio
          </Link>
          <Link href="/menu" className="rounded-full px-3 py-2 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f8efe4] hover:text-[#b45309]">
            Menú
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-[#15803d] transition-colors hover:bg-[#ecfdf3] hover:text-[#166534]"
          >
            <Icon name="whatsapp" size={16} />
            Contacto
          </a>
        </nav>

        <Link
          href="/menu"
          className="relative flex items-center gap-2 rounded-full bg-[#b45309] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(180,83,9,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#93370d]"
        >
          <Icon name="cart" size={18} />
          <span className="hidden sm:inline">Ordenar</span>
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#b45309] shadow-sm">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
