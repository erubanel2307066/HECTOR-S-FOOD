require('dotenv').config()
const { v2: cloudinary } = require('cloudinary')
const fs = require('fs')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const menuPath = './data/menu.json'
const items = JSON.parse(fs.readFileSync(menuPath, 'utf-8'))
console.log('Local items:', items.length)

const payload = JSON.stringify(items, null, 2)
const stream = cloudinary.uploader.upload_stream(
  {
    resource_type: 'raw',
    public_id: 'hectors-food/menu.json',
    overwrite: true,
    type: 'upload',
    invalidate: true,
  },
  (err, res) => {
    if (err) {
      console.error('UPLOAD FAIL:', err.message)
      process.exit(1)
    }
    console.log('UPLOADED version:', res.version, res.secure_url)

    // Read back immediately
    setTimeout(async () => {
      try {
        const r = await fetch(res.secure_url + '?_=' + Date.now(), { cache: 'no-store' })
        const txt = await r.text()
        const remote = JSON.parse(txt)
        console.log('READBACK status:', r.status, '| items:', remote.length)
      } catch (e) {
        console.error('READBACK FAIL:', e.message)
      }
    }, 1000)
  }
)
stream.end(Buffer.from(payload, 'utf-8'))
