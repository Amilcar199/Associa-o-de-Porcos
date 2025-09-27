const sharp = require('sharp')
const path = require('path')

async function createSolidPng(size, outPath, color = '#16a34a') {
  const buf = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: color
    }
  }).png().toBuffer()
  await sharp(buf).png().toFile(outPath)
}

async function main() {
  const pub = path.join(__dirname, '..', 'public')
  await createSolidPng(16, path.join(pub, 'favicon-16x16.png'))
  await createSolidPng(32, path.join(pub, 'favicon-32x32.png'))
  await createSolidPng(180, path.join(pub, 'apple-touch-icon.png'))
  console.log('Icons generated in public/: favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png')
}

main().catch((e) => { console.error(e); process.exit(1) })

