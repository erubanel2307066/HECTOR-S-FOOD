interface ConversationState {
  step: string
  data: Record<string, unknown>
  updatedAt: number
}

const conversations = new Map<string, ConversationState>()
const TTL = 30 * 60 * 1000

function cleanup() {
  const now = Date.now()
  for (const [phone, conv] of conversations) {
    if (now - conv.updatedAt > TTL) {
      conversations.delete(phone)
    }
  }
}

setInterval(cleanup, 5 * 60 * 1000).unref?.()

export function getConversation(phone: string): ConversationState | null {
  cleanup()
  const conv = conversations.get(phone)
  if (!conv) return null
  if (Date.now() - conv.updatedAt > TTL) {
    conversations.delete(phone)
    return null
  }
  return conv
}

export function setConversation(phone: string, step: string, data: Record<string, unknown> = {}) {
  conversations.set(phone, { step, data, updatedAt: Date.now() })
}

export function updateConversation(phone: string, data: Record<string, unknown>) {
  const conv = conversations.get(phone)
  if (conv) {
    conv.data = { ...conv.data, ...data }
    conv.updatedAt = Date.now()
  }
}

export function clearConversation(phone: string) {
  conversations.delete(phone)
}
