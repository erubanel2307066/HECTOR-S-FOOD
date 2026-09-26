'use client'

import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { Icon } from '@/components/ui/icons'
import { BUSINESS } from '@/lib/constants'

interface CartSidebarProps {
  onClose: () => void
}

function buildOrderMessage(
  name: string,
  phone: string,
  items: { name: string; price: number; quantity: number }[],
  total: number,
  orderType: 'delivery' | 'pickup',
  address: string,
  schedule: string
): string {
  const lines: string[] = []
  lines.push('🍽 *NUEVO PEDIDO - Hector\'s*')
  lines.push('')
  lines.push(`👤 *${name}*`)
  lines.push(`📱 ${phone}`)
  lines.push('')
  lines.push('*Pedido:*')
  for (const item of items) {
    const subtotal = item.price * item.quantity
    lines.push(`• ${item.quantity}x ${item.name} - $${subtotal.toFixed(2)}`)
  }
  lines.push('')
  lines.push('────────────────')
  lines.push(`💰 *Total: $${total.toFixed(2)} MXN*`)
  lines.push(orderType === 'delivery' ? '🚚 A domicilio' : '🚶 Para llevar')
  if (orderType === 'delivery' && address) {
    lines.push(`📍 ${address}`)
  }
  if (schedule) {
    lines.push(`🕐 ${schedule}`)
  }
  lines.push('')
  lines.push(`💵 Pago: ${BUSINESS.payment}`)
  return lines.join('\n')
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
      const message = buildOrderMessage(
        customerName.trim(),
        phone.trim(),
        items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
        total,
        orderType,
        address.trim(),
        schedule
      )

      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

      await fetch('/api/admin/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }).catch(() => {})

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank')

      setSuccess(true)
      clearCart()
    } catch {
      setError('Error al procesar el pedido. Intenta de nuevo.')
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
              <h3 className="mb-2 text-xl font-semibold text-[#111827]">¡Pedido listo!</h3>
              <p className="mb-2 text-sm text-[#6b7280]">
                Se abrió WhatsApp con tu pedido. Presiona <strong>Enviar</strong> para completarlo.
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
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-base font-bold text-white shadow-[0_12px_30px_rgba(37,211,102,0.25)] transition-colors hover:bg-[#1da851] disabled:bg-[#86e0a9]"
            >
              {sending ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Preparando...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Comprar por WhatsApp
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
