import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!(await isAdminFromRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const includeInactive = searchParams.get('all') === 'true'

  const items = await prisma.menuItem.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json({
    items: items.map(({ isActive, ...rest }) => ({ ...rest, available: isActive })),
  })
}

export async function POST(req: NextRequest) {
  if (!(await isAdminFromRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, description, price, category, image, available } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Categoría requerida' }, { status: 400 })
    }

    const code = `M${Date.now().toString(36).toUpperCase()}`

    const item = await prisma.menuItem.create({
      data: {
        code,
        name: name.trim().slice(0, 200),
        description: description ? String(description).trim().slice(0, 1000) : null,
        price,
        category: category.trim().slice(0, 50),
        image: image ? String(image).slice(0, 500) : null,
        isActive: available !== undefined ? Boolean(available) : true,
      },
    })
    const { isActive, ...itemRest } = item
    return NextResponse.json({ item: { ...itemRest, available: isActive } })
  } catch (error) {
    console.error('Failed to create menu item', error)
    return NextResponse.json(
      { error: 'No se pudo crear el plato. Revisa la conexión a la base de datos y las migraciones.' },
      { status: 500 }
    )
  }
}
