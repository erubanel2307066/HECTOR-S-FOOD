'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icons'
import Pagination from '@/components/ui/pagination'
import { toast } from 'sonner'

interface Customer {
  id: string
  phone: string
  name: string | null
  orders: number
  lastOrder: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const fetchCustomers = async () => {
    try {
      let url = `/api/admin/clientes?page=${page}&limit=20`
      if (search) url += `&search=${encodeURIComponent(search)}`
      const res = await fetch(url)
      const data = await res.json()
      setCustomers(data.clients || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { setLoading(true); fetchCustomers() }, [page, search])

  const startEditing = (customer: Customer) => {
    setEditing(customer)
    setName(customer.name || '')
    setPhone(customer.phone)
  }

  const saveCustomer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/admin/clientes/${editing.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone }),
    })
    setSaving(false)
    if (res.ok) { setEditing(null); fetchCustomers() } else toast.error('No se pudo actualizar el cliente.')
  }

  const deleteCustomer = async (customer: Customer) => {
    if (!confirm(`¿Eliminar a ${customer.name || customer.phone} de clientes? Sus pedidos se conservarán.`)) return
    const res = await fetch(`/api/admin/clientes/${customer.id}`, { method: 'DELETE' })
    if (res.ok) fetchCustomers(); else toast.error('No se pudo eliminar el cliente.')
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-[1.75rem] border border-[#efe2d0] bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-[#fef3c7] p-6 shadow-[0_16px_34px_rgba(31,41,55,0.06)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#b45309] shadow-[0_12px_24px_rgba(180,83,9,0.25)]">
          <Icon name="people" size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Clientes</h1>
          <p className="mt-1 text-sm text-[#6b7280]">{total} cliente{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mb-4 relative max-w-xs">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>
        : customers.length === 0 ? <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm"><div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50"><Icon name="people" size={32} className="text-gray-300" /></div><p className="font-medium text-gray-900">No hay clientes</p><p className="mt-1 text-sm text-gray-400">{search ? 'No se encontraron resultados' : 'Los clientes aparecerán cuando hagan pedidos'}</p></div>
        : <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-100"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cliente</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teléfono</th><th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Pedidos</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Último pedido</th><th className="px-4 py-3"><span className="sr-only">Acciones</span></th></tr></thead>
          <tbody>{customers.map((customer, index) => <tr key={customer.id} className={`border-b border-gray-50 transition-colors hover:bg-orange-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50"><Icon name="person" size={18} className="text-orange-600" /></div><span className="text-sm font-medium text-gray-900">{customer.name || 'Sin nombre'}</span></div></td><td className="px-4 py-3 text-sm text-gray-500">{customer.phone}</td><td className="px-4 py-3 text-center"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-sm font-semibold text-gray-900">{customer.orders}</span></td><td className="px-4 py-3 text-right text-sm text-gray-500">{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button onClick={() => startEditing(customer)} className="rounded-lg p-2 text-gray-500 hover:bg-orange-50" aria-label="Editar cliente"><Icon name="edit" size={17} /></button><button onClick={() => deleteCustomer(customer)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Eliminar cliente"><Icon name="delete" size={17} /></button></div></td></tr>)}</tbody></table></div></div>}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><form onSubmit={saveCustomer} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-900">Editar cliente</h2><button type="button" onClick={() => setEditing(null)} className="p-1 text-gray-500"><Icon name="close" size={20} /></button></div><label className="mb-4 block text-sm font-medium text-gray-700">Nombre<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900" /></label><label className="mb-5 block text-sm font-medium text-gray-700">Teléfono<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900" required /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-2.5 text-gray-600 hover:bg-gray-100">Cancelar</button><button disabled={saving} className="rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button></div></form></div>}
    </div>
  )
}
