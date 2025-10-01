/*
  Migra coleções principais do Mongo para Prisma/MySQL.
  Uso:
    MONGODB_URI=... DATABASE_URL=... node scripts/migrate-collections.js
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
    await mongo.connect()
    const mdb = mongo.db()
    await prisma.$connect()

    // Helpers
    const upsertById = async (model, id, data) => {
      return (prisma[model]).upsert({ where: { id }, create: { id, ...data }, update: data })
    }

    // News
    if (mdb.collection('news')) {
      const news = await mdb.collection('news').find({}).toArray()
      for (const n of news) {
        const id = String(n._id)
        await upsertById('news', id, {
          title: n.title,
          slug: n.slug,
          content: n.content,
          excerpt: n.excerpt,
          featuredImage: n.featuredImage,
          images: n.images || null,
          videos: n.videos || null,
          category: n.category,
          tags: n.tags || null,
          published: !!n.published,
          featured: !!n.featured,
          views: typeof n.views === 'number' ? n.views : 0,
          publishedAt: n.publishedAt || null,
          authorId: n.author ? String(n.author) : null,
          createdAt: n.createdAt || undefined,
          updatedAt: n.updatedAt || undefined,
        })
      }
      console.log(`✅ News migradas: ${news.length}`)
    }

    // Products
    if (mdb.collection('products')) {
      const prods = await mdb.collection('products').find({}).toArray()
      for (const p of prods) {
        const id = String(p._id)
        await upsertById('product', id, {
          name: p.name,
          description: p.description,
          breed: p.breed,
          age: p.age,
          weight: p.weight,
          price: p.price ?? null,
          pricePerKg: p.pricePerKg ?? null,
          saleForm: p.saleForm || null,
          images: p.images || [],
          videos: p.videos || null,
          features: p.features || null,
          healthStatus: p.healthStatus,
          vaccinated: !!p.vaccinated,
          location: p.location,
          code: p.code,
          availability: p.availability || 'available',
          tags: p.tags || null,
          isActive: p.isActive !== false,
          sellerId: p.seller ? String(p.seller) : null,
          createdAt: p.createdAt || undefined,
          updatedAt: p.updatedAt || undefined,
        })
      }
      console.log(`✅ Products migrados: ${prods.length}`)
    }

    // MemberContent
    if (mdb.collection('member_content')) {
      const mcs = await mdb.collection('member_content').find({}).toArray()
      for (const m of mcs) {
        const id = String(m._id)
        await upsertById('memberContent', id, {
          title: m.title,
          description: m.description,
          type: m.type,
          category: m.category,
          url: m.url || null,
          thumbnail: m.thumbnail || null,
          content: m.content || null,
          fileUrl: m.fileUrl || null,
          videoUrl: m.videoUrl || null,
          eventDate: m.eventDate || null,
          eventLocation: m.eventLocation || null,
          isFeatured: !!m.isFeatured,
          isActive: m.isActive !== false,
          tags: m.tags || null,
          views: typeof m.views === 'number' ? m.views : 0,
          downloads: typeof m.downloads === 'number' ? m.downloads : 0,
          authorId: m.author ? String(m.author) : null,
          createdAt: m.createdAt || undefined,
          updatedAt: m.updatedAt || undefined,
        })
      }
      console.log(`✅ MemberContent migrado: ${mcs.length}`)
    }

    // Contacts
    if (mdb.collection('contacts')) {
      const cs = await mdb.collection('contacts').find({}).toArray()
      for (const c of cs) {
        const id = String(c._id)
        await upsertById('contact', id, {
          name: c.name,
          email: c.email,
          phone: c.phone || null,
          subject: c.subject,
          message: c.message,
          status: c.status || 'new',
          createdAt: c.createdAt || undefined,
          updatedAt: c.updatedAt || undefined,
        })
      }
      console.log(`✅ Contacts migrados: ${cs.length}`)
    }

    // Collaborators
    if (mdb.collection('collaborators')) {
      const cols = await mdb.collection('collaborators').find({}).toArray()
      for (const c of cols) {
        const id = String(c._id)
        await upsertById('collaborator', id, {
          name: c.name,
          role: c.role,
          company: c.company || null,
          description: c.description || null,
          avatar: c.avatar,
          email: c.email || null,
          phone: c.phone || null,
          website: c.website || null,
          socialMedia: c.socialMedia || null,
          isActive: c.isActive !== false,
          featured: !!c.featured,
          orderIndex: typeof c.order === 'number' ? c.order : 0,
          createdAt: c.createdAt || undefined,
          updatedAt: c.updatedAt || undefined,
        })
      }
      console.log(`✅ Collaborators migrados: ${cols.length}`)
    }

    // MarketQuote
    if (mdb.collection('market_quotes')) {
      const mqs = await mdb.collection('market_quotes').find({}).toArray()
      for (const q of mqs) {
        const id = String(q._id)
        await upsertById('marketQuote', id, {
          weekISO: q.weekISO,
          region: q.region,
          saleForm: q.saleForm,
          status: q.status || 'draft',
          refPricePerKg: q.refPricePerKg,
          refPricePerHead: q.refPricePerHead || null,
          minSamples: typeof q.minSamples === 'number' ? q.minSamples : 0,
          methodologyNote: q.methodologyNote || null,
          createdById: q.createdBy ? String(q.createdBy) : null,
          approvedById: q.approvedBy ? String(q.approvedBy) : null,
          createdAt: q.createdAt || undefined,
          updatedAt: q.updatedAt || undefined,
        })
      }
      console.log(`✅ MarketQuotes migradas: ${mqs.length}`)
    }

    console.log('🎉 Migração de coleções concluída')
  } finally {
    await mongo.close().catch(() => {})
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((e) => {
  console.error('❌ Erro na migração de coleções:', e)
  process.exit(1)
})

