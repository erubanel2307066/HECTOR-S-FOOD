'use client'

import { useEffect, useState, useRef } from 'react'
import { Icon } from '@/components/ui/icons'
import { useNotifications } from './notifications-context'

interface DashboardData {
  totalOrders: number
  todayOrders: number
  totalCustomers: number
  pendingOrders: number
  menuItems: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const { pendingCount } = useNotifications()

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  const stats = [
    { title: 'Pedidos hoy', value: data.todayOrders, icon: 'orders' as const, bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { title: 'Pendientes', value: pendingCount || data.pendingOrders, icon: 'pending' as const, bg: 'bg-orange-50', textColor: 'text-orange-600', highlight: pendingCount > 0 },
    { title: 'Clientes', value: data.totalCustomers, icon: 'people' as const, bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Total pedidos', value: data.totalOrders, icon: 'receipt' as const, bg: 'bg-purple-50', textColor: 'text-purple-600' },
    { title: 'Platos activos', value: data.menuItems, icon: 'inventory' as const, bg: 'bg-orange-50', textColor: 'text-orange-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen del negocio y pedidos activos</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
              stat.highlight ? 'border-orange-300 ring-2 ring-orange-100 animate-pulse' : 'border-gray-200'
            }`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <Icon name={stat.icon} size={20} className={stat.textColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="orders" size={20} className="text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Pendientes</h2>
          {pendingCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>
        <PendingOrders />
      </div>
    </div>
  )
}

function PendingOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  const prevCountRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = () => {
    fetch('/api/admin/pedidos?status=pending,confirmed,preparing')
      .then((res) => res.json())
      .then((data) => {
        const newOrders = data.orders || []
        if (prevCountRef.current > 0 && newOrders.length > prevCountRef.current) {
          const diff = newOrders.length - prevCountRef.current
          setNotification(`🔔 ${diff} pedido${diff > 1 ? 's' : ''} nuevo${diff > 1 ? 's' : ''}`)
          if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => {})
          }
          setTimeout(() => setNotification(null), 5000)
        }
        prevCountRef.current = newOrders.length
        setOrders(newOrders)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVggoKIbF1fdJy0u41nOj1nhIWMe2BdeqG7xY1tQ0Bqi4qQg2Rahq7AyIpxRT9ujoyUhWNVh7LEx4dvQz1xkI2UhWJWh7LEyIdwRD9yko2UhWJWh7LEyIdwRD9yko2UhWJWh7LEyId=')
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Icon name="done" size={28} className="text-emerald-500" />
        </div>
        <p className="font-medium text-gray-900">No hay pedidos pendientes</p>
        <p className="mt-1 text-sm text-gray-400">¡Buen trabajo!</p>
      </div>
    )
  }

  const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pendiente', bg: 'bg-orange-50', text: 'text-orange-600' },
    confirmed: { label: 'Confirmado', bg: 'bg-blue-50', text: 'text-blue-600' },
    preparing: { label: 'Preparando', bg: 'bg-amber-50', text: 'text-amber-600' },
  }

  return (
    <div className="space-y-3">
      {notification && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 animate-fade-in">
          {notification}
        </div>
      )}

      {orders.map((order: any) => {
        const st = statusStyles[order.status] || { label: order.status, bg: 'bg-gray-50', text: 'text-gray-600' }
        return (
          <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">#{order.id.slice(-4).toUpperCase()}</span>
                <span className="text-sm text-gray-500">{order.phone}</span>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.bg} ${st.text}`}>{st.label}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{order.type === 'delivery' ? '🚚 A domicilio' : '🚶 Para llevar'}</span>
              {order.schedule && <span>🕐 {order.schedule}</span>}
            </div>
            {order.address && <p className="mt-1 text-sm text-gray-400">📍 {order.address}</p>}
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-semibold text-orange-500">${order.total?.toFixed(2)} MXN</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
