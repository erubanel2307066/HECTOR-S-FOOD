import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'

const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'image', 'available']

function mapBody(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = String(body.name).trim().slice(0, 200)
  if (body.description !== undefined) data.description = body.description ? String(body.description).trim().slice(0, 1000) : null
  if (body.price !== undefined) data.price = Number(body.price)
  if (body.category !== undefined) data.category = String(body.category).trim().slice(0, 50)
  if (body.image !== undefined) data.image = body.image ? String(body.image).slice(0, 500) : null
  if (body.available !== undefined) data.isActive = Boolean(body.available)
  return data
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const item = await prisma.menuItem.update({ where: { id }, data: mapBody(body) })
    const { isActive, ...rest } = item
    return NextResponse.json({ item: { ...rest, available: isActive } })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    const item = await prisma.menuItem.update({ where: { id }, data: mapBody(body) })
    const { isActive, ...rest } = item
    return NextResponse.json({ item: { ...rest, available: isActive } })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.menuItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}
