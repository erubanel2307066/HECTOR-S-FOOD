import { NextRequest, NextResponse } from 'next/server'
import { getMenu, updateMenuItem, deleteMenuItem } from '@/lib/menu-store'
import { isAdmin } from '@/lib/auth'
import { deleteImage } from '@/lib/cloudinary'

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

async function deleteImageIfCloudinary(url: string | null) {
  if (!url || !url.includes('cloudinary')) return
  await deleteImage(url)
}

async function handleUpdate(req: NextRequest, id: string) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await getMenu()
    const current = items.find((i) => i.id === id)
    if (!current) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const body = await req.json()
    const mapped = mapBody(body)

    if (mapped.image !== undefined && mapped.image !== current.image) {
      await deleteImageIfCloudinary(current.image)
    }

    const updated = await updateMenuItem(id, mapped)
    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const { isActive, ...rest } = updated
    return NextResponse.json({ item: { ...rest, available: isActive } })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(req, id)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleUpdate(req, id)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const items = await getMenu()
    const item = items.find((i) => i.id === id)
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await deleteImageIfCloudinary(item.image)
    await deleteMenuItem(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
}
