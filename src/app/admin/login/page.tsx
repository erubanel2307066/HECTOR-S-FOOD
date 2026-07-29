'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/icons'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) router.push('/admin')
    else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#111827] p-4 sm:p-6">
      <Image
        src="/images/login-background.png"
        alt="Mesa con comida casera de Hector's"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[58%_center] sm:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#111827]/55 via-[#111827]/35 to-[#111827]/75 sm:bg-gradient-to-r sm:from-[#111827]/70 sm:via-[#111827]/25 sm:to-[#111827]/55" />

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#fff7ed] shadow-lg ring-1 ring-white/60 backdrop-blur-sm">
            <Icon name="store" size={32} className="text-[#b45309]" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Hector&apos;s</h1>
          <p className="mt-1 text-sm text-white/90">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] border border-white/70 bg-[#fffcf8]/95 p-6 shadow-2xl backdrop-blur-md">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#4b5563]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[0.95rem] border border-[#e7dbca] bg-white px-4 py-2.5 text-[#111827] placeholder-[#9ca3af] transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#b45309]"
              placeholder="Ingresa la contraseña"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className="flex items-center gap-2 rounded-[0.95rem] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]"><Icon name="error" size={16} />{error}</div>}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[0.95rem] bg-[#b45309] py-2.5 font-semibold text-white transition-colors hover:bg-[#93370d] disabled:bg-[#d9a677]">
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Icon name="logout" size={18} className="rotate-180" />Entrar</>}
          </button>
        </form>
      </div>
    </div>
  )
}
