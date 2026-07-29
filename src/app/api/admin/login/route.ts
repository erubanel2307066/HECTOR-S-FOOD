import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateKey = `login:${ip}`

  const { allowed, remaining } = checkRateLimit(rateKey, 5, 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera 1 minuto.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  try {
    const { password } = await req.json()

    const hash = process.env.ADMIN_PASSWORD_HASH
    const plainPassword = process.env.ADMIN_PASSWORD

    let valid = false
    if (hash) {
      valid = await bcrypt.compare(String(password), hash)
    } else if (plainPassword) {
      valid = String(password) === plainPassword
    }

    if (valid) {
      const token = createSession()
      const cookieStore = await cookies()
      cookieStore.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Request inválido' }, { status: 400 })
  }
}
