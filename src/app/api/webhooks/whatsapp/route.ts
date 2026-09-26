import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { markAsRead } from '@/lib/whatsapp'
import { sanitizePhone } from '@/lib/validation'
import { getConversation } from '@/lib/conversation-store'
import { handleWelcome, handleMainMenu, handleInfo } from '@/handlers/welcome'
import { handleMenuToday, handleMenuFull } from '@/handlers/menu'
import {
  handleStartOrder,
  handleAwaitingItems,
  handleAwaitingAddress,
  handleAddressReceived,
  handleAwaitingSchedule,
  handleScheduleReceived,
  handleCancelOrder,
} from '@/handlers/order'

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.WHATSAPP_APP_SECRET) return false
  const expected = `sha256=${crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET).update(body).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Verification failed', { status: 403 })
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' })
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue

        for (const message of change.value.messages || []) {
          const phone = sanitizePhone(message.from)
          const msgType = message.type

          await markAsRead(message.id)

          if (msgType === 'text') {
            const text = message.text.body.trim()
            await handleIncomingText(phone, text)
          }

          if (msgType === 'interactive') {
            const interactive = message.interactive
            const buttonId = interactive?.button_reply?.id || interactive?.list_reply?.id
            if (buttonId) {
              await handleButtonClick(phone, buttonId)
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[Webhook Error]', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

async function handleIncomingText(phone: string, text: string) {
  const lower = text.toLowerCase().trim()

  if (['hola', 'buenas', 'hello', 'hey'].includes(lower)) {
    return handleWelcome(phone)
  }

  if (['menu', 'menú', 'menu del dia', 'menú del día', 'menú hoy', 'menu hoy'].includes(lower)) {
    return handleMenuToday(phone)
  }

  if (['menu completo', 'menú completo', 'ver menu completo', 'ver menú completo'].includes(lower)) {
    return handleMenuFull(phone)
  }

  if (['info', 'información', 'informacion', 'horarios'].includes(lower)) {
    return handleInfo(phone)
  }

  if (['ordenar', 'quiero pedir', 'hacer pedido', 'pedido', 'pedir'].includes(lower)) {
    return handleMenuToday(phone)
  }

  const conv = getConversation(phone)

  if (!conv) {
    return handleWelcome(phone)
  }

  if (conv.step === 'main_menu') {
    return handleMainMenu(phone)
  }

  if (conv.step === 'awaiting_items') {
    return handleAwaitingItems(phone, text)
  }

  if (conv.step === 'awaiting_address') {
    return handleAddressReceived(phone, text)
  }

  if (conv.step === 'awaiting_schedule') {
    return handleScheduleReceived(phone, text)
  }

  return handleMainMenu(phone)
}

async function handleButtonClick(phone: string, buttonId: string) {
  const conv = getConversation(phone)

  switch (buttonId) {
    case 'main_menu':
      return handleMainMenu(phone)

    case 'menu_today':
      return handleMenuToday(phone)

    case 'menu_full':
      return handleMenuFull(phone)

    case 'info':
      return handleInfo(phone)

    case 'start_order':
      return handleStartOrder(phone)

    case 'type_delivery':
      if (conv) return handleAwaitingAddress(phone, 'delivery')
      return handleMainMenu(phone)

    case 'type_pickup':
      if (conv) return handleAwaitingSchedule(phone, 'pickup', '')
      return handleMainMenu(phone)

    case 'cancel_order':
      return handleCancelOrder(phone)

    default:
      return handleMainMenu(phone)
  }
}
