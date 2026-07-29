'use client'

import { useEffect, useState, useRef } from 'react'
import { Icon } from '@/components/ui/icons'

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
  { value: 'pollos', label: 'Pollos', color: 'bg-amber-100 text-amber-700' },
  { value: 'hamburguesas', label: 'Hamburguesas', color: 'bg-red-100 text-red-700' },
  { value: 'tacos', label: 'Tacos', color: 'bg-orange-100 text-orange-700' },
  { value: 'guarniciones', label: 'Guarniciones', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'bebidas', label: 'Bebidas', color: 'bg-blue-100 text-blue-700' },
  { value: 'postres', label: 'Postres', color: 'bg-purple-100 text-purple-700' },
]

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/menu')
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showForm])

  const filteredItems = search
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  const openNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSave = () => {
    closeForm()
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este plato?')) return
    await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/admin/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !item.available }),
    })
    fetchItems()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-[1.75rem] border border-[#efe2d0] bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-[#fef3c7] p-6 shadow-[0_16px_34px_rgba(31,41,55,0.06)]">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#b45309] shadow-[0_12px_24px_rgba(180,83,9,0.25)]">
            <Icon name="restaurantMenu" size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Menú</h1>
            <p className="mt-1 text-sm text-[#6b7280]">{items.filter((i) => i.available).length} platos activos</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-full bg-[#b45309] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#93370d]"
        >
          <Icon name="add" size={18} />
          Nuevo plato
        </button>
      </div>

      {showForm && (
        <div ref={formRef} className="mb-6">
          <MenuItemForm item={editing} onSave={handleSave} onCancel={closeForm} />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mb-4 relative max-w-xs">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b45309] border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Icon name="restaurantMenu" size={32} className="text-gray-300" />
          </div>
          <p className="font-medium text-gray-900">No hay platos en el menú</p>
          <p className="mt-1 text-sm text-gray-400">Agrega tu primer plato</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="font-medium text-gray-900">{search ? 'No se encontraron resultados' : 'No hay platos en el menú'}</p>
          <p className="mt-1 text-sm text-gray-400">{search ? 'Intenta con otro nombre' : 'Agrega tu primer plato'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const catItems = filteredItems.filter((i) => i.category === cat.value)
            if (catItems.length === 0) return null
            return (
              <div key={cat.value}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                  <span className="text-xs text-gray-400">{catItems.length} plato{catItems.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {catItems.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="relative aspect-[4/5] bg-gray-50">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="image" size={36} className="text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => toggleAvailable(item)}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              item.available
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {item.available ? 'Disponible' : 'Agotado'}
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-base font-bold text-orange-500">${item.price.toFixed(2)}</span>
                        </div>
                        {item.description && (
                          <p className="mb-3 line-clamp-2 text-sm text-gray-500">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                          <button
                            onClick={() => openEdit(item)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
                          >
                            <Icon name="edit" size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Icon name="delete" size={14} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MenuItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItem | null
  onSave: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [description, setDescription] = useState(item?.description || '')
  const [price, setPrice] = useState(item?.price?.toString() || '')
  const [category, setCategory] = useState(item?.category || 'hamburguesas')
  const [available, setAvailable] = useState(item?.available ?? true)
  const [image, setImage] = useState(item?.image || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.url) setImage(data.url)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const body = {
      name,
      description,
      price: parseFloat(price),
      category,
      available,
      image: image || null,
    }

    const url = item ? `/api/admin/menu/${item.id}` : '/api/admin/menu'
    const method = item ? 'PATCH' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-[#efe2d0] bg-[#fffcf8] p-6 shadow-[0_14px_32px_rgba(31,41,55,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">{item ? 'Editar plato' : 'Nuevo plato'}</h2>
        <button type="button" onClick={onCancel} className="text-[#6b7280] hover:text-[#111827]">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-[#4b5563]">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
            placeholder="Ej: Pollo Asado"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
            placeholder="Descripción del plato..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#4b5563]">Precio (MXN)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-[#111827] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f8efe4]"
            >
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#b45309] border-t-transparent" />
              ) : (
                <Icon name="upload" size={16} />
              )}
              Subir imagen
            </button>
            {image && (
              <div className="flex items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 rounded-[0.95rem] border border-[#e7dbca] bg-white px-3 py-2 text-sm text-[#4b5563] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                  placeholder="O pega una URL..."
                />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-orange-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm font-medium text-[#4b5563]">Disponible</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-[#f2e7db] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[0.95rem] px-4 py-2 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f8efe4]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-[0.95rem] bg-[#b45309] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#93370d] disabled:bg-[#d9a677]"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name="check" size={16} />
          )}
          {item ? 'Guardar cambios' : 'Crear plato'}
        </button>
      </div>
    </form>
  )
}
