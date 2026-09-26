'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icons'

interface DashboardData {
  menuItems: number
  totalMenuItems: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

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
    { title: 'Platos activos', value: data.menuItems, icon: 'restaurantMenu' as const, bg: 'bg-orange-50', textColor: 'text-orange-600' },
    { title: 'Total platos', value: data.totalMenuItems, icon: 'inventory' as const, bg: 'bg-blue-50', textColor: 'text-blue-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión del menú de Hector&apos;s</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <Icon name={stat.icon} size={20} className={stat.textColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-0.5 text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-medium">ℹ️ Los pedidos llegan por WhatsApp</p>
        <p className="mt-1 text-blue-600">
          Los clientes realizan pedidos desde la web o directamente por WhatsApp. No hay pedidos almacenados en el panel.
        </p>
      </div>
    </div>
  )
}
