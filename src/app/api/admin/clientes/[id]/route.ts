import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { sanitizePhone, isValidPhone, validateLength } from '@/lib/validation'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const data: { name?: string | null; phone?: string } = {}
  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (name) {
      const err = validateLength('name', name)
      if (err) return NextResponse.json({ error: err }, { status: 400 })
    }
    data.name = name || null
  }
  if (body.phone !== undefined) {
    const phone = sanitizePhone(String(body.phone))
    if (!isValidPhone(phone)) return NextResponse.json({ error: 'Teléfono inválido (10-15 dígitos)' }, { status: 400 })
    data.phone = phone
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })

  try {
    const client = await prisma.$transaction(async (tx) => {
      const current = await tx.client.findUnique({ where: { id } })
      if (!current) throw new Error('NOT_FOUND')
      if (data.phone && data.phone !== current.phone) {
        await tx.order.updateMany({ where: { phone: current.phone }, data: { phone: data.phone } })
      }
      return tx.client.update({ where: { id }, data })
    })
    return NextResponse.json({ client })
  } catch (error) {
    const message = error instanceof Error && error.message === 'NOT_FOUND' ? 'Client not found' : 'Could not update client'
    return NextResponse.json({ error: message }, { status: message === 'Client not found' ? 404 : 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
}
