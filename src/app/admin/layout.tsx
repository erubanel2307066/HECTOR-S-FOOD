'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Icon } from '@/components/ui/icons'
import { NotificationContext } from './notifications-context'
import { Toaster } from 'sonner'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' as const },
  { href: '/admin/menu', label: 'Menú', icon: 'restaurantMenu' as const },
  { href: '/admin/pedidos', label: 'Pedidos', icon: 'orders' as const },
  { href: '/admin/clientes', label: 'Clientes', icon: 'people' as const },
  { href: '/admin/difusion', label: 'Difusión', icon: 'broadcast' as const },
  { href: '/admin/configuracion', label: 'Configuración', icon: 'settings' as const },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const isLoginPage = pathname === '/admin/login'

  const fetchPending = useCallback(() => {
    fetch('/api/admin/pedidos?status=pending')
      .then((r) => r.json())
      .then((d) => setPendingCount(d.orders?.length || 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }

    const check = async () => {
      try {
        const res = await fetch('/api/admin/check')
        if (!res.ok) {
          router.push('/admin/login')
        } else {
          setAuthed(true)
          setChecking(false)
          fetchPending()
        }
      } catch {
        router.push('/admin/login')
      }
    }
    check()
  }, [router, isLoginPage, fetchPending])

  useEffect(() => {
    if (!authed) return
    const interval = setInterval(fetchPending, 10000)
    return () => clearInterval(interval)
  }, [authed, fetchPending])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-gray-500">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  if (!authed) return null

  return (
    <NotificationContext.Provider value={{ pendingCount, refresh: fetchPending }}>
      <Toaster position="top-right" richColors closeButton />
      <div className="flex min-h-screen bg-background">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-lg transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
                <Icon name="restaurantMenu" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Hector<span className="text-orange-500">&apos;</span>s
                </h1>
                <p className="text-[10px] text-gray-400">Panel de administración</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const active = pathname === item.href
              const showBadge = item.href === '/admin/pedidos' && pendingCount > 0
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </a>
              )
            })}
          </nav>

          <div className="border-t border-gray-100 p-3">
            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' })
                router.push('/admin/login')
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <Icon name="logout" size={20} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Icon name="menu" size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
                <Icon name="restaurantMenu" size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">Hector&apos;s</span>
            </div>
          </div>

          <div className="mx-auto max-w-6xl p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </NotificationContext.Provider>
  )
}
