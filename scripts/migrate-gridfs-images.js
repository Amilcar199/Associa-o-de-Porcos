/*
  Exporta arquivos do GridFS (bucket 'images') para disco e cria registros em Prisma.Image
  Uso:
    MONGODB_URI=... DATABASE_URL=... node scripts/migrate-gridfs-images.js
*/

const { MongoClient, GridFSBucket, ObjectId } = require('mongodb')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'images')
const PUBLIC_BASE = '/uploads/images'

async function ensureDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function saveStreamToFile(stream, filename) {
  await ensureDir()
  const filepath = path.join(OUTPUT_DIR, filename)
  return new Promise((resolve, reject) => {
    const write = fs.createWriteStream(filepath)
    stream.pipe(write)
    write.on('finish', async () => {
      const stats = await fs.promises.stat(filepath)
      resolve({ filepath, size: stats.size })
    })
    write.on('error', reject)
    stream.on('error', reject)
  })
}

function uniqueName(original) {
  const ext = path.extname(original || '').toLowerCase() || '.bin'
  const base = path.basename(original || 'file', ext).replace(/[^a-zA-Z0-9-_]/g, '')
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`
}

async function main() {
  const mongoUri = process.env.MONGODB_URI
  const dbUrl = process.env.DATABASE_URL
  if (!mongoUri) throw new Error('MONGODB_URI não configurada')
  if (!dbUrl) throw new Error('DATABASE_URL não configurada')

  const mongo = new MongoClient(mongoUri)
  const prisma = new PrismaClient()

  try {
    console.log('🔌 Conectando ao MongoDB...')
    await mongo.connect()
    const db = mongo.db()
    const bucket = new GridFSBucket(db, { bucketName: 'images' })
    console.log('✅ MongoDB OK')

    console.log('🔌 Conectando ao Prisma/MySQL...')
    await prisma.$connect()
    console.log('✅ Prisma OK')

    const files = await bucket.find({}).toArray()
    console.log(`📦 Arquivos no GridFS: ${files.length}`)

    let ok = 0, fail = 0
    for (const f of files) {
      const orig = (f?.filename || 'file').toString()
      const filename = uniqueName(orig)
      const contentType = f?.metadata?.contentType || 'application/octet-stream'
      const stream = bucket.openDownloadStream(new ObjectId(f._id))
      try {
        const { filepath, size } = await saveStreamToFile(stream, filename)
        await prisma.image.create({
          data: {
            filename,
            contentType,
            size: size || (f.length || 0),
            category: f?.metadata?.category || null,
            url: `${PUBLIC_BASE}/${filename}`,
            path: filepath,
            uploadedById: null
          }
        })
        ok++
        if (ok % 50 === 0) console.log(`... ${ok} imagens exportadas`)
      } catch (e) {
        console.error('Falha ao exportar arquivo', f?._id?.toString(), e?.message)
        fail++
      }
    }
    console.log(`✅ Exportação concluída. Sucesso: ${ok}, Falhas: ${fail}`)
  } finally {
    await mongo.close().catch(() => {})
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((e) => {
  console.error('❌ Erro na exportação de imagens:', e)
  process.exit(1)
})

