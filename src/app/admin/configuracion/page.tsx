'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icons'

export default function SettingsPage() {
  const [whatsappNumber] = useState(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '')

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-[1.75rem] border border-[#efe2d0] bg-gradient-to-br from-[#fff7ed] via-[#fffcf8] to-[#fef3c7] p-6 shadow-[0_16px_34px_rgba(31,41,55,0.06)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#b45309] shadow-[0_12px_24px_rgba(180,83,9,0.25)]">
          <Icon name="settings" size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Configuración</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Ajustes del sistema</p>
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        <div className="rounded-[1.25rem] border border-[#efe2d0] bg-[#fffcf8] p-5 shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ecfdf3]">
              <Icon name="whatsapp" size={20} className="text-[#16a34a]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">WhatsApp Business</h3>
              <p className="text-xs text-[#8a7057]">Número de atención al cliente</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-[#16a34a] hover:text-[#15803d]"
          >
            <Icon name="whatsapp" size={16} />
            {whatsappNumber}
          </a>
        </div>

        <div className="rounded-[1.25rem] border border-[#efe2d0] bg-[#fffcf8] p-5 shadow-[0_12px_30px_rgba(31,41,55,0.05)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff7ed]">
              <Icon name="store" size={20} className="text-[#b45309]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">Hector&apos;s</h3>
              <p className="text-xs text-[#8a7057]">Horario: Lunes a Sábado 11:00 - 22:00</p>
            </div>
          </div>
          <p className="text-sm text-[#6b7280]">
            Sistema de pedidos • Entrega propia • Efectivo contra entrega
          </p>
        </div>
      </div>
    </div>
  )
}
