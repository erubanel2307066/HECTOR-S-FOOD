import { Icon } from '@/components/ui/icons'

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
      <Icon name="error" size={16} />
      {message}
    </div>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
        <Icon name={icon as never} size={32} className="text-gray-300" />
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
  )
}
