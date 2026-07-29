import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { isAdmin } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const MAGIC_BYTES: { bytes: number[]; ext: string; mime: string }[] = [
  { bytes: [0xff, 0xd8, 0xff], ext: 'jpg', mime: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4e, 0x47], ext: 'png', mime: 'image/png' },
  { bytes: [0x52, 0x49, 0x46, 0x46], ext: 'webp', mime: 'image/webp' },
  { bytes: [0x47, 0x49, 0x46, 0x38], ext: 'gif', mime: 'image/gif' },
]

function detectFileType(buffer: Buffer): { ext: string; mime: string } | null {
  for (const type of MAGIC_BYTES) {
    if (buffer.length >= type.bytes.length) {
      const match = type.bytes.every((b, i) => buffer[i] === b)
      if (match) return { ext: type.ext, mime: type.mime }
    }
  }
  return null
}

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

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es muy grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const detected = detectFileType(buffer)
    if (!detected) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' },
        { status: 400 }
      )
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${detected.ext}`

    const dir = join(process.cwd(), 'public', 'images', 'menu')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    const url = `/images/menu/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[Upload Error]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
