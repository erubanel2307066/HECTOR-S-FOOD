'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icons'

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    setError('')

    try {
      const res = await fetch('/api/admin/difusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setMessage('')
      } else {
        setError(data.error || 'Error al enviar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-[1.75rem] border border-[#efe2d0] bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-[#fef3c7] p-6 shadow-[0_16px_34px_rgba(31,41,55,0.06)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#b45309] shadow-[0_12px_24px_rgba(180,83,9,0.25)]">
          <Icon name="broadcast" size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Difusión</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Envía un mensaje a todos tus clientes por WhatsApp</p>
        </div>
      </div>

      <div className="max-w-xl">
        <form onSubmit={handleSend} className="space-y-4 rounded-[1.5rem] border border-[#efe2d0] bg-[#fffcf8] p-6 shadow-[0_14px_32px_rgba(31,41,55,0.06)]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#4b5563]">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-3 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              placeholder="Escribe el mensaje que se enviará a todos tus clientes..."
              required
              disabled={sending}
            />
            <p className="mt-1.5 text-xs text-[#8a7057]">
              <Icon name="info" size={12} className="mr-1" />
              Se enviará vía WhatsApp a todos los clientes registrados
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[0.95rem] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              <Icon name="error" size={16} />
              {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 rounded-[0.95rem] bg-[#ecfdf3] px-3 py-2 text-sm text-[#166534]">
              <Icon name="check" size={16} />
              Enviado a {result.sent} cliente{result.sent !== 1 ? 's' : ''}
              {result.failed > 0 && ` (${result.failed} fallos)`}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[#b45309] py-2.5 font-semibold text-white transition-colors hover:bg-[#93370d] disabled:bg-[#d9a677]"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Icon name="send" size={18} />
                Enviar a todos
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
