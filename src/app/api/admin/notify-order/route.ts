import { NextRequest, NextResponse } from 'next/server'
import { sendText } from '@/lib/whatsapp'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rateKey = `notify:${ip}`
  const { allowed } = checkRateLimit(rateKey, 10, 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiados pedidos. Espera un minuto.' }, { status: 429 })
  }

  try {
    const { message } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    if (!businessNumber) {
      return NextResponse.json({ ok: false, error: 'WhatsApp del negocio no configurado' }, { status: 200 })
    }

    const result = await sendText(businessNumber, message)
    return NextResponse.json({ ok: !!result })
  } catch (error) {
    console.error('[Notify Order Error]', error)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
