'use client'

import { Icon } from '@/components/ui/icons'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="back" size={16} />
        Anterior
      </button>

      <span className="px-3 py-2 text-sm text-gray-500">
        Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
        <span className="font-semibold text-gray-900">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
        <Icon name="forward" size={16} />
      </button>
    </div>
  )
}
