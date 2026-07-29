import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
    }

    client = createClient(url, key, { auth: { persistSession: false } })
  }
  return client
}

export const BUCKET_NAME = 'menu-images'

export function getPublicUrl(path: string): string {
  const { data } = getClient().storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImage(filename: string, buffer: ArrayBuffer, contentType: string) {
  const { error } = await getClient().storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, { contentType })
  return error
}

export async function deleteImage(filename: string) {
  const { error } = await getClient().storage
    .from(BUCKET_NAME)
    .remove([filename])
  return error
}
