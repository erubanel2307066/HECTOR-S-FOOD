import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { BUCKET_NAME, getPublicUrl, uploadImage } from '@/lib/supabase'

const MAX_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es muy grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const bytes = await file.arrayBuffer()

    const uploadError = await uploadImage(filename, bytes, file.type)

    if (uploadError) {
      console.error('[Supabase Upload Error]', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const url = getPublicUrl(filename)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Upload Error]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
