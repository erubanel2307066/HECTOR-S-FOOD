import { cookies } from 'next/headers'
import { validateSession } from './session'

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return false
  return validateSession(token)
}
