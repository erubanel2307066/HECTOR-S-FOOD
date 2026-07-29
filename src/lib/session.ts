import crypto from 'crypto'

interface Session {
  token: string
  createdAt: number
}

const sessions = new Map<string, Session>()
const SESSION_TTL = 24 * 60 * 60 * 1000 // 24 horas

// Limpiar sesiones expiradas cada 10 minutos
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(token)
    }
  }
}, 10 * 60 * 1000)

export function createSession(): string {
  const token = crypto.randomBytes(32).toString('hex')
  sessions.set(token, { token, createdAt: Date.now() })
  return token
}

export function validateSession(token: string): boolean {
  const session = sessions.get(token)
  if (!session) return false
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(token)
    return false
  }
  return true
}

export function destroySession(token: string): void {
  sessions.delete(token)
}
