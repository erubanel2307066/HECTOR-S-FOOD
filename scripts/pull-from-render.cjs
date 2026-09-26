require('dotenv').config()
const { v2: cloudinary } = require('cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const BASE = 'https://hectors-food.onrender.com'

async function main() {
  const login = await fetch(BASE + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  })
  const cookie = login.headers.get('set-cookie')
  console.log('LOGIN:', login.status)

  const res = await fetch(BASE + '/api/admin/menu?all=true', { headers: { Cookie: cookie } })
  const data = await res.json()
  const apiItems = data.items || data
  console.log('GET /api/admin/menu?all=true:', res.status, '| items:', apiItems.length)
  if (!Array.isArray(apiItems) || apiItems.length === 0) {
    console.error('No se obtuvieron items:', JSON.stringify(data).slice(0, 300))
    process.exit(1)
  }

  const items = apiItems.map(({ available, ...rest }) => ({ ...rest, isActive: available !== undefined ? Boolean(available) : true }))

  const sample = items.find((i) => i.name === 'Mole de merrano')
  console.log('Mole de merrano presente:', !!sample, '| image:', sample ? sample.image : '-')
  console.log('campos:', Object.keys(items[0]).join(','))
  console.log('activos:', items.filter((i) => i.isActive === true).length, '/', items.length)

  const invalid = items.filter((i) => typeof i.isActive !== 'boolean' || 'available' in i || !i.id || !i.name)
  if (invalid.length > 0) {
    console.error('ITEMS INVALIDOS:', JSON.stringify(invalid.slice(0, 3)))
    process.exit(1)
  }

  const payload = JSON.stringify(items, null, 2)
  await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: 'hectors-food/menu.json',
        overwrite: true,
        type: 'upload',
        invalidate: true,
      },
      (err, res) => (err ? reject(err) : resolve(res))
    )
    stream.end(Buffer.from(payload, 'utf-8'))
  })
    .then((res) => console.log('SUBIDO a Cloudinary v' + res.version, '| items:', items.length))
    .catch((e) => {
      console.error('FAIL:', e.message)
      process.exit(1)
    })

  await new Promise((r) => setTimeout(r, 3000))
  const resource = await cloudinary.api.resource('hectors-food/menu.json', { resource_type: 'raw' })
  const remote = await (await fetch(resource.secure_url, { cache: 'no-store' })).json()
  console.log('VERIFICACION Cloudinary:', remote.length, 'items | mole:', !!remote.find((i) => i.name === 'Mole de merrano'))
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
