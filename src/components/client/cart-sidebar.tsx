'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { Icon } from '@/components/ui/icons'
import { BUSINESS } from '@/lib/constants'

interface CartSidebarProps {
  onClose: () => void
}

export default function CartSidebar({ onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [schedule, setSchedule] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const handleSubmit = async () => {
    if (!customerName.trim() || !phone.trim()) {
      setError('Nombre y teléfono son obligatorios')
      return
    }
    if (orderType === 'delivery' && !address.trim()) {
      setError('Dirección es obligatoria para delivery')
      return
    }

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          type: orderType,
          address: address.trim() || null,
          schedule: schedule || null,
          items: items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
          total,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        clearCart()
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar el pedido')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col bg-[#fffaf3] shadow-[0_20px_80px_rgba(15,23,42,0.25)] animate-slide-in">
        <div className="flex items-center justify-between border-b border-[#efe2d0] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f7efe3] text-[#b45309]">
              <Icon name="cart" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Mi pedido</h2>
              <p className="text-xs text-[#8a7057]">{items.length} {items.length === 1 ? 'ítem' : 'ítems'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs font-medium text-[#dc2626] transition-colors hover:text-[#b91c1c]">
                Vaciar
              </button>
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#f7efe3]">
              <Icon name="close" size={18} className="text-[#6b7280]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {success ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf3]">
                <Icon name="check" size={40} className="text-[#16a34a]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#111827]">¡Pedido enviado!</h3>
              <p className="mb-2 text-sm text-[#6b7280]">
                Recibirás la confirmación por WhatsApp en unos momentos.
              </p>
              <div className="mb-6 rounded-[1.25rem] border border-[#f4d9b3] bg-[#fff7ed] p-3 text-sm text-[#374151]">
                <p className="font-medium text-[#9a2c00]">👨‍🍳 {BUSINESS.prep}</p>
                <p className="mt-0.5 text-[#6b7280]">
                  Lo preparamos cuando llega tu pedido. ⏱ <strong>~{BUSINESS.deliveryMax} min</strong>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-[#b45309] px-6 py-2.5 font-semibold text-white transition-colors hover:bg-[#93370d]"
              >
                Cerrar
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7efe3]">
                <Icon name="cart" size={40} className="text-[#d1b089]" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-[#111827]">Tu carrito está vacío</h3>
              <p className="text-sm text-[#9ca3af]">Explora nuestro menú y agrega tus favoritos</p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] bg-[#fdf7ef] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111827]">{item.name}</p>
                    <p className="text-xs text-[#8a7057]">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="ml-3 flex items-center gap-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-white hover:text-[#b45309]"
                    >
                      <Icon name="remove" size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-[#111827]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-white hover:text-[#b45309]"
                    >
                      <Icon name="add" size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#fff1f2] hover:text-[#dc2626]"
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {items.length > 0 && (
                <div className="mt-4 space-y-3 rounded-[1.25rem] border border-[#efe2d0] bg-white/70 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon name="person" size={16} className="text-[#9a2c00]" />
                    <span className="text-sm font-medium text-[#374151]">Tus datos</span>
                  </div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full rounded-2xl border border-[#e5d9c8] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Teléfono (ej: 521234567890)"
                    className="w-full rounded-2xl border border-[#e5d9c8] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setOrderType('delivery')}
                      className={`flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition-colors ${
                        orderType === 'delivery'
                          ? 'border-[#f4d9b3] bg-[#fff7ed] text-[#9a2c00]'
                          : 'border-transparent bg-[#f7efe3] text-[#6b7280] hover:bg-[#f3e4d4]'
                      }`}
                    >
                      <Icon name="delivery" size={16} />
                      Delivery
                    </button>
                    <button
                      onClick={() => setOrderType('pickup')}
                      className={`flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition-colors ${
                        orderType === 'pickup'
                          ? 'border-[#f4d9b3] bg-[#fff7ed] text-[#9a2c00]'
                          : 'border-transparent bg-[#f7efe3] text-[#6b7280] hover:bg-[#f3e4d4]'
                      }`}
                    >
                      <Icon name="store" size={16} />
                      Para llevar
                    </button>
                  </div>

                  {orderType === 'delivery' && (
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Dirección de entrega"
                      className="w-full rounded-2xl border border-[#e5d9c8] bg-white px-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                    />
                  )}

                  <div className="rounded-[1.25rem] border border-[#f4d9b3] bg-[#fff7ed] p-3 text-xs text-[#6b7280]">
                    <p className="mb-0.5 font-medium text-[#9a2c00]">👨‍🍳 Pedido fresco — lo preparamos cuando lo recibes</p>
                    <p>
                      ⏱ Entrega estimada: <strong>{BUSINESS.deliveryRange}</strong> después de confirmar
                    </p>
                  </div>

                  <div>
                    <select
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="w-full rounded-2xl border border-[#e5d9c8] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                    >
                      <option value="">Lo antes posible</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                    </select>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">
                  <Icon name="error" size={16} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && !success && (
          <div className="border-t border-[#efe2d0] p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b7280]">Subtotal</span>
              <span className="font-semibold text-[#111827]">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b7280]">Método de pago</span>
              <span className="flex items-center gap-1 font-semibold text-[#111827]">
                <Icon name="payment" size={14} className="text-[#16a34a]" />
                Efectivo
              </span>
            </div>
            <div className="border-t border-[#efe2d0] py-1.5 text-center text-xs text-[#9ca3af]">
              🕐 {BUSINESS.deliveryNote}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827]">Total</span>
              <span className="text-xl font-bold text-[#b45309]">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b45309] py-3 text-base font-bold text-white shadow-[0_12px_30px_rgba(180,83,9,0.22)] transition-colors hover:bg-[#93370d] disabled:bg-[#f4c381]"
            >
              {sending ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Icon name="send" size={20} />
                  Enviar pedido
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
