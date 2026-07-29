'use client'

import { useEffect, useState, useRef } from 'react'
import { Icon } from '@/components/ui/icons'
import Pagination from '@/components/ui/pagination'
import { toast } from 'sonner'

type Status = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_way' | 'delivered' | 'cancelled'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  available: boolean
  image: string | null
}

interface OrderItem {
  id: string
  quantity: number
  name?: string
  price?: number
  menuItem?: MenuItem
}

interface Order {
  id: string
  customerName: string
  phone: string
  type: string
  address: string | null
  schedule: string | null
  total: number
  status: Status
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<Status, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  on_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statusColors: Record<Status, string> = {
  pending: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-emerald-100 text-emerald-700',
  on_way: 'bg-sky-100 text-sky-700',
  delivered: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
}

const nextStatus: Record<Status, Status | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  on_way: 'delivered',
  delivered: null,
  cancelled: null,
}

const orderTypeLabels: Record<string, { label: string; icon: string }> = {
  delivery: { label: 'A domicilio', icon: 'delivery' },
  pickup: { label: 'Para llevar', icon: 'store' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'all'>('pending')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOrders = async () => {
    try {
      let url = `/api/admin/pedidos?page=${page}&limit=20`
      if (search) url += `&search=${encodeURIComponent(search)}`
      if (dateFilter === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        url += `&since=${today.toISOString()}`
      } else if (dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        url += `&since=${weekAgo.toISOString()}`
      }
      if (filter !== 'all') url += `&status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [dateFilter, filter, search])

  useEffect(() => {
    setLoading(true)
    fetchOrders()
    pollRef.current = setInterval(fetchOrders, 15000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [page, dateFilter, filter, search])

  const updateOrder = async (id: string, data: Partial<Order>, nextStatusLabel?: string) => {
    if (nextStatusLabel) {
      const order = orders.find((o) => o.id === id)
      if (order && !confirm(`¿Cambiar estado de "${statusLabels[order.status]}" a "${nextStatusLabel}"?`)) return
    }
    setSaving(true)
    const res = await fetch(`/api/admin/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (res.ok) {
      setEditingId(null)
      fetchOrders()
    } else {
      toast.error('No se pudo actualizar el pedido.')
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return
    const res = await fetch(`/api/admin/pedidos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setExpandedId(null)
      fetchOrders()
    } else toast.error('No se pudo eliminar el pedido.')
  }

  const now = new Date()
  const todayStr = now.toDateString()
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr)

  const filters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'on_way', 'delivered', 'cancelled']
  const dateFilters = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: '7 días' },
    { value: 'all', label: 'Todas' },
  ]

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
            <Icon name="orders" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="mt-1 text-sm text-gray-500">
              {todayOrders.length} pedido{todayOrders.length !== 1 ? 's' : ''} hoy
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por teléfono..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        {dateFilters.map((d) => (
          <button
            key={d.value}
            onClick={() => setDateFilter(d.value as 'today' | 'week' | 'all')}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              dateFilter === d.value
                ? 'bg-orange-50 text-orange-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const isActive = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f as Status | 'all')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'Todas' : statusLabels[f as Status]}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <Icon name="orders" size={32} className="text-gray-300" />
            </div>
            <p className="font-medium text-gray-900">No hay pedidos</p>
            <p className="mt-1 text-sm text-gray-400">Los pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedId === order.id
            return (
              <div key={order.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div
                  className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        #{order.id.slice(-4).toUpperCase()}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span className="text-xs">{new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      <Icon name={isExpanded ? 'arrowUp' : 'arrowDown'} size={16} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{order.customerName}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">{order.phone}</span>
                    <span className="text-gray-300">•</span>
                    <span className="font-semibold text-orange-500">${order.total?.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                    <Icon name={order.type === 'delivery' ? 'delivery' : 'store'} size={14} />
                    <span>{orderTypeLabels[order.type]?.label || order.type}</span>
                    {order.schedule && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Icon name="timer" size={14} />
                        <span>{order.schedule}</span>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            <span className="mr-2 text-gray-400">×{item.quantity}</span>
                            {item.menuItem?.name || item.name || 'Ítem'}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${((item.menuItem?.price || item.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.address && (
                      <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
                        <Icon name="location" size={14} />
                        <span>{order.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-0.5 flex-wrap">
                        <span className="mr-1.5 text-xs text-gray-400">Actualizar:</span>
                        {nextStatus[order.status] && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrder(order.id, { status: nextStatus[order.status]! }, statusLabels[nextStatus[order.status]!])
                            }}
                            className="rounded-full px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100"
                          >
                            → {statusLabels[nextStatus[order.status]!]}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrder(order.id, { status: 'cancelled' })
                            }}
                            className="ml-1 rounded-full px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(editingId === order.id ? null : order.id) }}
                          className="ml-2 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                          aria-label="Editar pedido"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteOrder(order.id) }}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          aria-label="Eliminar pedido"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </div>
                    {editingId === order.id && (
                      <OrderEditForm order={order} saving={saving} onCancel={() => setEditingId(null)} onSave={(data) => updateOrder(order.id, data)} />
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

function OrderEditForm({ order, saving, onCancel, onSave }: {
  order: Order
  saving: boolean
  onCancel: () => void
  onSave: (data: Partial<Order>) => void
}) {
  const [form, setForm] = useState({
    phone: order.phone,
    type: order.type,
    address: order.address || '',
    schedule: order.schedule || '',
    total: String(order.total),
    status: order.status,
  })

  return (
    <form
      className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ ...form, total: Number(form.total), status: form.status as Status })
      }}
    >
      <label className="text-xs font-medium text-gray-600">Teléfono
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" required />
      </label>
      <label className="text-xs font-medium text-gray-600">Estatus
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="text-xs font-medium text-gray-600">Tipo
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
          <option value="delivery">A domicilio</option><option value="pickup">Para llevar</option>
        </select>
      </label>
      <label className="text-xs font-medium text-gray-600">Total
        <input type="number" min="0" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" required />
      </label>
      <label className="text-xs font-medium text-gray-600 sm:col-span-2">Dirección
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
      </label>
      <label className="text-xs font-medium text-gray-600">Horario
        <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
      </label>
      <div className="flex items-end justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancelar</button>
        <button disabled={saving} className="rounded-xl bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
