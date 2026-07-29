'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/client/header'
import { CartProvider } from '@/lib/cart-context'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <CartProvider>
      <Header />
      {children}
    </CartProvider>
  )
}
