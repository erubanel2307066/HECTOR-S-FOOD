const WHATSAPP_API = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_ID}/messages`
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN

function isConfigured(): boolean {
  return !!(WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID &&
    WHATSAPP_TOKEN !== 'TU_TOKEN_AQUI' &&
    process.env.WHATSAPP_PHONE_ID !== 'TU_PHONE_ID_AQUI')
}

interface WhatsAppButton {
  type: 'reply'
  reply: { id: string; title: string }
}

interface WhatsAppRow {
  id: string
  title: string
  description?: string
}

interface WhatsAppSection {
  title: string
  rows: WhatsAppRow[]
}

export async function sendText(to: string, text: string) {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  })
}

export async function sendButtons(to: string, header: string, body: string, buttons: WhatsAppButton[]) {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: header },
      body: { text: body },
      action: { buttons },
    },
  })
}

export async function sendList(to: string, header: string, body: string, buttonText: string, sections: WhatsAppSection[]) {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: header },
      body: { text: body },
      action: { button: buttonText, sections },
    },
  })
}

export async function markAsRead(messageId: string) {
  return sendMessage({
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  })
}

async function sendMessage(body: Record<string, unknown>) {
  if (!isConfigured()) {
    console.warn('[WhatsApp] No configurado — falta WHATSAPP_TOKEN o WHATSAPP_PHONE_ID en .env')
    return null
  }

  try {
    const res = await fetch(WHATSAPP_API!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) console.error('[WhatsApp API Error]', data)
    return data
  } catch (error) {
    console.error('[WhatsApp API]', error)
    return null
  }
}
