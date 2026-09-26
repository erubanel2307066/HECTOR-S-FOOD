import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

export async function uploadImage(buffer: Buffer, folder = 'hectors-food'): Promise<string | null> {
  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (err, res) => {
          if (err || !res) reject(err)
          else resolve(res as { secure_url: string })
        }
      )
      stream.end(buffer)
    })
    return result.secure_url
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error)
    return null
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(?:.*?\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$/i)
    if (!match) return
    const publicId = match[1]
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('[Cloudinary Delete Error]', error)
  }
}

const MENU_PUBLIC_ID = 'hectors-food/menu.json'

export function getMenuRawUrl(): string | null {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) return null
  return `https://res.cloudinary.com/${cloud}/raw/upload/${MENU_PUBLIC_ID}`
}

export async function uploadMenuJson(content: string): Promise<boolean> {
  if (!isCloudinaryConfigured()) return false
  try {
    const buffer = Buffer.from(content, 'utf-8')
    await new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: MENU_PUBLIC_ID,
          overwrite: true,
          type: 'upload',
          invalidate: true,
        },
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
      stream.end(buffer)
    })
    return true
  } catch (error) {
    console.error('[Cloudinary Menu Upload Error]', error)
    return false
  }
}

export async function fetchMenuJson(): Promise<string | null> {
  if (!isCloudinaryConfigured()) return null

  try {
    const resource = await cloudinary.api.resource(MENU_PUBLIC_ID, { resource_type: 'raw' })
    if (resource?.secure_url) {
      const res = await fetch(resource.secure_url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return await res.text()
    }
  } catch {
  }

  const url = getMenuRawUrl()
  if (!url) return null
  try {
    const res = await fetch(`${url}?_=${Date.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}
