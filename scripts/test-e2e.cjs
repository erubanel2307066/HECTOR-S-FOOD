require('dotenv').config()
const BASE = 'http://localhost:3000'
const CLOUD_MENU = 'https://res.cloudinary.com/boqkj76i/raw/upload/hectors-food/menu.json'

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD no definido en .env')
    process.exit(1)
  }
  // 1. Login
  const loginRes = await fetch(BASE + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
  })
  const cookie = loginRes.headers.get('set-cookie')
  console.log('1. LOGIN:', loginRes.status)

  // 2. Upload image
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  )
  const fd = new FormData()
  fd.append('file', new Blob([png], { type: 'image/png' }), 'test.png')
  const upRes = await fetch(BASE + '/api/admin/upload', {
    method: 'POST',
    headers: { Cookie: cookie },
    body: fd,
  })
  const up = await upRes.json()
  console.log('2. UPLOAD:', upRes.status, up.url)

  // 3. Create dish
  const createRes = await fetch(BASE + '/api/admin/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: 'PERSIST TEST',
      price: 77,
      category: 'tacos',
      image: up.url,
      available: true,
    }),
  })
  const created = await createRes.json()
  console.log('3. CREATE:', createRes.status, created.item.id)

  // 4. Verify in public API
  const apiRes = await fetch(BASE + '/api/menu')
  const api = await apiRes.json()
  const found = api.items.find((i) => i.name === 'PERSIST TEST')
  console.log('4. PUBLIC API:', apiRes.status, '| found:', !!found, '| image:', found?.image)

  // 5. Verify persisted in Cloudinary (simulates Render restart)
  await new Promise((r) => setTimeout(r, 1500))
  const remoteRes = await fetch(CLOUD_MENU + '?_=' + Date.now(), { cache: 'no-store' })
  const remote = await remoteRes.json()
  const remoteFound = remote.find((i) => i.name === 'PERSIST TEST')
  console.log('5. CLOUDINARY PERSISTED:', remoteRes.status, '| items:', remote.length, '| found:', !!remoteFound)

  // 6. Image renders through next/image optimizer
  const opt = await fetch(
    BASE + '/_next/image?url=' + encodeURIComponent(found.image) + '&w=828&q=75'
  )
  console.log('6. IMAGE OPTIMIZER:', opt.status, opt.headers.get('content-type'))

  // 7. Cleanup test dish
  const delRes = await fetch(BASE + '/api/admin/menu/' + created.item.id, {
    method: 'DELETE',
    headers: { Cookie: cookie },
  })
  console.log('7. CLEANUP:', delRes.status)

  // 8. Verify cleanup persisted to Cloudinary too
  await new Promise((r) => setTimeout(r, 1500))
  const after = await (await fetch(CLOUD_MENU + '?_=' + Date.now(), { cache: 'no-store' })).json()
  console.log('8. AFTER DELETE -> Cloudinary items:', after.length, '| test gone:', !after.find((i) => i.name === 'PERSIST TEST'))
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
