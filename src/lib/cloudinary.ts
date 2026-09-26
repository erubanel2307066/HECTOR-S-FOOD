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
