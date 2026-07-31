import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { validateSession } from './session'

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    if (!token) return false
    return validateSession(token)
  } catch {
    return false
  }
}

export function getAdminSessionTokenFromRequest(req: NextRequest | Request): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|; )admin_session=([^;]+)/)
  return match?.[1] ?? null
}

export async function isAdminFromRequest(req: NextRequest | Request): Promise<boolean> {
  const token = getAdminSessionTokenFromRequest(req)
  if (!token) return false
  return validateSession(token)
}
