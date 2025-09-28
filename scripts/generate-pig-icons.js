const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateFromSvg(svgPath, outPath, size, bg = '#16a34a') {
  const svg = fs.readFileSync(svgPath)
  const base = await sharp({
    create: { width: size, height: size, channels: 4, background: bg }
  }).png().toBuffer()

  // Rasterize SVG to be smaller than the base, then composite centered
  const overlaySize = Math.floor(size * 0.66)
  const overlay = await sharp(svg).resize(overlaySize, overlaySize, { fit: 'contain' }).png().toBuffer()

  await sharp(base)
    .composite([{ input: overlay, gravity: 'centre' }])
    .png()
    .toFile(outPath)
}

async function main() {
  const svgPath = path.join(__dirname, '..', 'public', 'icons', 'pig.svg')
  const pub = path.join(__dirname, '..', 'public')
  await generateFromSvg(svgPath, path.join(pub, 'icon-192x192.png'), 192)
  await generateFromSvg(svgPath, path.join(pub, 'icon-512x512.png'), 512)
  await generateFromSvg(svgPath, path.join(pub, 'maskable-icon-192x192.png'), 192)
  await generateFromSvg(svgPath, path.join(pub, 'maskable-icon-512x512.png'), 512)
  console.log('Generated pig-based PWA icons.')
}

main().catch((e)=>{ console.error(e); process.exit(1) })

