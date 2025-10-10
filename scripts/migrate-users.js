/*
  Usage:
    MONGODB_URI=... DATABASE_URL=... node scripts/migrate-users.js
*/

const { PrismaClient } = require('@prisma/client')
const { MongoClient } = require('mongodb')

async function main() {
  const mongoUri = process.env.MONGODB_URI
  const dbUrl = process.env.DATABASE_URL
  if (!mongoUri) throw new Error('MONGODB_URI não configurada')
  if (!dbUrl) throw new Error('DATABASE_URL não configurada')

  const prisma = new PrismaClient()
  const mongo = new MongoClient(mongoUri)

  try {
    console.log('🔌 Conectando ao MongoDB...')
    await mongo.connect()
    const mdb = mongo.db()
    console.log('✅ MongoDB OK')

    console.log('🔌 Conectando ao Prisma/MySQL...')
    await prisma.$connect()
    console.log('✅ Prisma OK')

    const usersCol = mdb.collection('users')
    const cursor = usersCol.find({})
    let migrated = 0
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      const id = String(doc._id)
      const data = {
        id,
        name: doc.name || 'Sem nome',
        email: String(doc.email || '').toLowerCase(),
        password: String(doc.password || ''),
        emailVerified: doc.emailVerified || null,
        image: doc.image || null,
        role: doc.role || 'visitor',
        avatar: doc.avatar || null,
        phone: doc.phone || null,
        company: doc.company || null,
        bio: doc.bio || null,
        location: doc.location || null,
        website: doc.website || null,
        socialMedia: doc.socialMedia || null,
        preferences: doc.preferences || null,
        isActive: doc.isActive !== false,
        lastLogin: doc.lastLogin || null,
        passwordResetToken: doc.passwordResetToken || null,
        passwordResetExpires: doc.passwordResetExpires || null,
        loginAttempts: typeof doc.loginAttempts === 'number' ? doc.loginAttempts : 0,
        lockUntil: doc.lockUntil || null,
        createdAt: doc.createdAt || undefined,
        updatedAt: doc.updatedAt || undefined,
      }

      await prisma.user.upsert({
        where: { id },
        create: data,
        update: data
      })
      migrated++
      if (migrated % 100 === 0) console.log(`... ${migrated} usuários migrados`)
    }

    console.log(`✅ Migração de usuários concluída: ${migrated}`)
  } finally {
    await mongo.close().catch(() => {})
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((e) => {
  console.error('❌ Erro na migração de usuários:', e)
  process.exit(1)
})

