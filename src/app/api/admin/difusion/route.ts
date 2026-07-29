import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendText } from '@/lib/whatsapp'
import { validateLength } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateKey = 'difusion'
  const { allowed } = checkRateLimit(rateKey, 1, 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Espera 1 minuto entre difusiones' }, { status: 429 })
  }

  if (!process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN === 'TU_TOKEN_AQUI') {
    return NextResponse.json({
      error: 'WhatsApp no está configurado. Agrega WHATSAPP_TOKEN y WHATSAPP_PHONE_ID en .env',
    }, { status: 400 })
  }

  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
  }

  const err = validateLength('message', message)
  if (err) return NextResponse.json({ error: err }, { status: 400 })

  const clients = await prisma.client.findMany({
    where: { phone: { not: '' } },
  })

  let sent = 0
  let failed = 0
  for (const client of clients) {
    try {
      const result = await sendText(client.phone, message)
      if (result) sent++
      else failed++
      await new Promise((r) => setTimeout(r, 200))
    } catch (e) {
      console.error(`Failed to send to ${client.phone}:`, e)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: clients.length })
}
