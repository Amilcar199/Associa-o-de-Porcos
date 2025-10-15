#!/usr/bin/env node
/*
  Migração de dados: MongoDB -> Prisma (MySQL)
  - Conecta no Mongo via Mongoose usando MONGODB_URI
  - Conecta no MySQL via Prisma usando DATABASE_URL
  - Migra coleções: users, news, products, collaborators, member_content, contacts, site_config, market_quotes, activity_logs, pushsubscriptions, legal_sections
  - Trata ObjectId -> string, datas e relacionamentos básicos
  - Idempotente: upsert por chaves únicas quando possível
*/

const mongoose = require('mongoose')
const { PrismaClient } = require('@prisma/client')
// Nota: não importamos modelos TS; usamos coleções cruas do Mongo.

const prisma = new PrismaClient()

function asStringId(v) {
  if (!v) return null
  try {
    // ObjectId, string, etc.
    return String(v)
  } catch {
    return null
  }
}

function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

async function migrateUsers() {
  const users = await mongoose.connection.db.collection('users').find({}).toArray()
  let created = 0, updated = 0
  for (const u of users) {
    const data = {
      id: asStringId(u._id) || undefined,
      name: u.name || '',
      email: (u.email || '').toLowerCase(),
      password: u.password || '',
      role: u.role || 'visitor',
      avatar: u.avatar || null,
      phone: u.phone || null,
      company: u.company || null,
      bio: u.bio || null,
      location: u.location || null,
      website: u.website || null,
      social: u.socialMedia || null,
      isActive: u.isActive !== false,
      emailVerified: null,
      image: u.avatar || null,
      createdAt: u.createdAt || new Date(),
      updatedAt: u.updatedAt || new Date(),
    }

    try {
      const res = await prisma.user.upsert({
        where: { email: data.email },
        create: data,
        update: {
          name: data.name,
          role: data.role,
          avatar: data.avatar,
          phone: data.phone,
          company: data.company,
          bio: data.bio,
          location: data.location,
          website: data.website,
          social: data.social,
          isActive: data.isActive,
          image: data.image,
          updatedAt: data.updatedAt,
        },
      })
      if (res.createdAt.getTime() === data.createdAt.getTime()) created++
      else updated++
    } catch (e) {
      console.error('User upsert error for', data.email, e.message)
    }
  }
  console.log(`Users: created=${created}, updated=${updated}`)
}

async function findUserIdByAny(userRef) {
  if (!userRef) return null
  const idString = asStringId(userRef)
  if (!idString) return null
  // Try by original id (if present in MySQL already)
  const byId = await prisma.user.findFirst({ where: { id: idString }, select: { id: true } })
  if (byId) return byId.id
  // Try by email from Mongo record
  try {
    const mongoUser = await mongoose.connection.db
      .collection('users')
      .findOne({ _id: new mongoose.Types.ObjectId(idString) })
    if (mongoUser?.email) {
      const byEmail = await prisma.user.findUnique({ where: { email: String(mongoUser.email).toLowerCase() } })
      if (byEmail) return byEmail.id
    }
  } catch {}
  return null
}

async function migrateNews() {
  const items = await mongoose.connection.db.collection('news').find({}).toArray()
  let created = 0, updated = 0
  for (const n of items) {
    const authorId = await findUserIdByAny(n.author)
    const data = {
      title: n.title || '',
      slug: n.slug || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content: n.content || '',
      excerpt: n.excerpt || '',
      featuredImage: n.featuredImage || '',
      images: ensureArray(n.images),
      videos: ensureArray(n.videos),
      authorId: authorId,
      category: n.category || 'news',
      tags: ensureArray(n.tags),
      published: !!n.published,
      featured: !!n.featured,
      views: typeof n.views === 'number' ? n.views : 0,
      publishedAt: n.publishedAt || null,
      createdAt: n.createdAt || new Date(),
      updatedAt: n.updatedAt || new Date(),
    }

    try {
      await prisma.news.upsert({
        where: { slug: data.slug },
        create: data,
        update: {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          featuredImage: data.featuredImage,
          images: data.images,
          videos: data.videos,
          authorId: data.authorId,
          category: data.category,
          tags: data.tags,
          published: data.published,
          featured: data.featured,
          views: data.views,
          publishedAt: data.publishedAt,
          updatedAt: data.updatedAt,
        }
      })
      created++
    } catch (e) {
      console.error('News upsert error for', data.slug, e.message)
      updated++
    }
  }
  console.log(`News: processed=${items.length}`)
}

async function migrateProducts() {
  const items = await mongoose.connection.db.collection('products').find({}).toArray()
  for (const p of items) {
    const sellerId = await findUserIdByAny(p.seller)
    const data = {
      name: p.name || '',
      description: p.description || '',
      breed: p.breed || 'Outro',
      age: typeof p.age === 'number' ? p.age : 0,
      weight: typeof p.weight === 'number' ? p.weight : 0,
      price: p.price ?? null,
      pricePerKg: p.pricePerKg ?? null,
      saleForm: p.saleForm || null,
      images: ensureArray(p.images),
      videos: ensureArray(p.videos),
      features: ensureArray(p.features),
      healthStatus: p.healthStatus || 'good',
      vaccinated: !!p.vaccinated,
      location: p.location || '',
      code: p.code || `${p.breed || 'PRD'}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,7)}`,
      availability: p.availability || 'available',
      sellerId: sellerId,
      tags: ensureArray(p.tags),
      isActive: p.isActive !== false,
      createdAt: p.createdAt || new Date(),
      updatedAt: p.updatedAt || new Date(),
    }

    try {
      await prisma.product.upsert({
        where: { code: data.code },
        create: data,
        update: {
          name: data.name,
          description: data.description,
          breed: data.breed,
          age: data.age,
          weight: data.weight,
          price: data.price,
          pricePerKg: data.pricePerKg,
          saleForm: data.saleForm,
          images: data.images,
          videos: data.videos,
          features: data.features,
          healthStatus: data.healthStatus,
          vaccinated: data.vaccinated,
          location: data.location,
          availability: data.availability,
          sellerId: data.sellerId,
          tags: data.tags,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        }
      })
    } catch (e) {
      console.error('Product upsert error for', data.code, e.message)
    }
  }
  console.log(`Products: processed=${items.length}`)
}

async function migrateCollaborators() {
  const items = await mongoose.connection.db.collection('collaborators').find({}).toArray()
  for (const c of items) {
    try {
      await prisma.collaborator.upsert({
        where: { id: asStringId(c._id) || 'noop' }, // fallback: no unique natural key, use create
        create: {
          id: asStringId(c._id) || undefined,
          name: c.name || '',
          role: c.role || '',
          company: c.company || null,
          description: c.description || null,
          avatar: c.avatar || '',
          email: c.email || null,
          phone: c.phone || null,
          website: c.website || null,
          linkedin: c.socialMedia?.linkedin || null,
          instagram: c.socialMedia?.instagram || null,
          facebook: c.socialMedia?.facebook || null,
          isActive: c.isActive !== false,
          featured: !!c.featured,
          orderInt: typeof c.order === 'number' ? c.order : 0,
        },
        update: {
          name: c.name || '',
          role: c.role || '',
          company: c.company || null,
          description: c.description || null,
          avatar: c.avatar || '',
          email: c.email || null,
          phone: c.phone || null,
          website: c.website || null,
          linkedin: c.socialMedia?.linkedin || null,
          instagram: c.socialMedia?.instagram || null,
          facebook: c.socialMedia?.facebook || null,
          isActive: c.isActive !== false,
          featured: !!c.featured,
          orderInt: typeof c.order === 'number' ? c.order : 0,
        }
      })
    } catch (e) {
      // If id conflict or missing, try create
      try {
        await prisma.collaborator.create({ data: {
          name: c.name || '',
          role: c.role || '',
          company: c.company || null,
          description: c.description || null,
          avatar: c.avatar || '',
          email: c.email || null,
          phone: c.phone || null,
          website: c.website || null,
          linkedin: c.socialMedia?.linkedin || null,
          instagram: c.socialMedia?.instagram || null,
          facebook: c.socialMedia?.facebook || null,
          isActive: c.isActive !== false,
          featured: !!c.featured,
          orderInt: typeof c.order === 'number' ? c.order : 0,
        } })
      } catch (e2) {
        console.error('Collaborator upsert/create error', e2.message)
      }
    }
  }
  console.log(`Collaborators: processed=${items.length}`)
}

async function migrateMemberContent() {
  const items = await mongoose.connection.db.collection('member_content').find({}).toArray()
  for (const m of items) {
    const authorId = await findUserIdByAny(m.author)
    try {
      await prisma.memberContent.upsert({
        where: { id: asStringId(m._id) || 'noop' },
        create: {
          id: asStringId(m._id) || undefined,
          title: m.title || '',
          description: m.description || '',
          type: m.type || 'article',
          category: m.category || '',
          url: m.url || null,
          thumbnail: m.thumbnail || null,
          content: m.content || null,
          fileUrl: m.fileUrl || null,
          videoUrl: m.videoUrl || null,
          eventDate: m.eventDate || null,
          eventLocation: m.eventLocation || null,
          isFeatured: !!m.isFeatured,
          isActive: m.isActive !== false,
          authorId: authorId,
          tags: ensureArray(m.tags),
          views: typeof m.views === 'number' ? m.views : 0,
          downloads: typeof m.downloads === 'number' ? m.downloads : 0,
        },
        update: {
          title: m.title || '',
          description: m.description || '',
          type: m.type || 'article',
          category: m.category || '',
          url: m.url || null,
          thumbnail: m.thumbnail || null,
          content: m.content || null,
          fileUrl: m.fileUrl || null,
          videoUrl: m.videoUrl || null,
          eventDate: m.eventDate || null,
          eventLocation: m.eventLocation || null,
          isFeatured: !!m.isFeatured,
          isActive: m.isActive !== false,
          authorId: authorId,
          tags: ensureArray(m.tags),
          views: typeof m.views === 'number' ? m.views : 0,
          downloads: typeof m.downloads === 'number' ? m.downloads : 0,
        }
      })
    } catch (e) {
      console.error('MemberContent upsert error', e.message)
    }
  }
  console.log(`MemberContent: processed=${items.length}`)
}

async function migrateContacts() {
  const items = await mongoose.connection.db.collection('contacts').find({}).toArray()
  for (const c of items) {
    try {
      await prisma.contact.upsert({
        where: { id: asStringId(c._id) || 'noop' },
        create: {
          id: asStringId(c._id) || undefined,
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || null,
          subject: c.subject || '',
          message: c.message || '',
          status: c.status || 'new',
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date(),
        },
        update: {
          name: c.name || '',
          email: c.email || '',
          phone: c.phone || null,
          subject: c.subject || '',
          message: c.message || '',
          status: c.status || 'new',
          updatedAt: new Date(),
        }
      })
    } catch (e) {
      console.error('Contact upsert error', e.message)
    }
  }
  console.log(`Contacts: processed=${items.length}`)
}

async function migrateSiteConfig() {
  const cfg = await mongoose.connection.db.collection('site_config').findOne({})
  if (!cfg) { console.log('SiteConfig: none'); return }
  try {
    await prisma.siteConfig.upsert({
      where: { id: asStringId(cfg._id) || 'singleton' },
      create: {
        id: asStringId(cfg._id) || undefined,
        logoUrl: cfg.logoUrl || '',
        publicLogoUrl: cfg.publicLogoUrl || '',
        adminLogoUrl: cfg.adminLogoUrl || '',
        currency: cfg.currency || 'AOA',
        locale: cfg.locale || 'pt-AO',
        contactEmail: cfg.contactEmail || '',
        contactPhone: cfg.contactPhone || '',
        whatsappNumber: cfg.whatsappNumber || '',
        facebookUrl: cfg.facebookUrl || '',
        instagramUrl: cfg.instagramUrl || '',
        linkedinUrl: cfg.linkedinUrl || '',
        youtubeUrl: cfg.youtubeUrl || '',
        twitterUrl: cfg.twitterUrl || '',
        tiktokUrl: cfg.tiktokUrl || '',
      },
      update: {
        logoUrl: cfg.logoUrl || '',
        publicLogoUrl: cfg.publicLogoUrl || '',
        adminLogoUrl: cfg.adminLogoUrl || '',
        currency: cfg.currency || 'AOA',
        locale: cfg.locale || 'pt-AO',
        contactEmail: cfg.contactEmail || '',
        contactPhone: cfg.contactPhone || '',
        whatsappNumber: cfg.whatsappNumber || '',
        facebookUrl: cfg.facebookUrl || '',
        instagramUrl: cfg.instagramUrl || '',
        linkedinUrl: cfg.linkedinUrl || '',
        youtubeUrl: cfg.youtubeUrl || '',
        twitterUrl: cfg.twitterUrl || '',
        tiktokUrl: cfg.tiktokUrl || '',
      }
    })
    console.log('SiteConfig: upserted')
  } catch (e) {
    console.error('SiteConfig upsert error', e.message)
  }
}

async function migrateMarketQuotes() {
  const items = await mongoose.connection.db.collection('market_quotes').find({}).toArray()
  for (const q of items) {
    const createdById = await findUserIdByAny(q.createdBy)
    const approvedById = await findUserIdByAny(q.approvedBy)
    try {
      await prisma.marketQuote.upsert({
        where: { weekISO_region_saleForm_status: {
          weekISO: q.weekISO,
          region: q.region,
          saleForm: q.saleForm,
          status: q.status || 'draft'
        } },
        create: {
          weekISO: q.weekISO,
          region: q.region,
          saleForm: q.saleForm,
          status: q.status || 'draft',
          refPricePerKg: q.refPricePerKg,
          refPricePerHead: q.refPricePerHead ?? null,
          minSamples: q.minSamples ?? 0,
          methodologyNote: q.methodologyNote || null,
          createdById: createdById,
          approvedById: approvedById,
        },
        update: {
          refPricePerKg: q.refPricePerKg,
          refPricePerHead: q.refPricePerHead ?? null,
          minSamples: q.minSamples ?? 0,
          methodologyNote: q.methodologyNote || null,
          createdById: createdById,
          approvedById: approvedById,
        }
      })
    } catch (e) {
      console.error('MarketQuote upsert error', e.message)
    }
  }
  console.log(`MarketQuotes: processed=${items.length}`)
}

async function migrateActivityLogs() {
  const items = await mongoose.connection.db.collection('activity_logs').find({}).toArray()
  for (const a of items) {
    const userId = await findUserIdByAny(a.user)
    try {
      await prisma.activityLog.create({ data: {
        userId: userId || undefined,
        type: a.type || 'activity',
        ip: a.ip || null,
        userAgent: a.userAgent || null,
        metadata: a.metadata || null,
        createdAt: a.createdAt || new Date(),
        updatedAt: a.updatedAt || new Date(),
      } })
    } catch (e) {
      // ignore duplicates to avoid bloat
    }
  }
  console.log(`ActivityLogs: processed=${items.length}`)
}

async function migratePushSubscriptions() {
  const items = await mongoose.connection.db.collection('pushsubscriptions').find({}).toArray()
  for (const s of items) {
    const userId = await findUserIdByAny(s.userId)
    try {
      await prisma.pushSubscription.upsert({
        where: { endpoint: s.endpoint },
        create: {
          endpoint: s.endpoint,
          expirationTime: s.expirationTime ?? null,
          p256dh: s.keys?.p256dh || '',
          auth: s.keys?.auth || '',
          userId: userId,
        },
        update: {
          expirationTime: s.expirationTime ?? null,
          p256dh: s.keys?.p256dh || '',
          auth: s.keys?.auth || '',
          userId: userId,
        }
      })
    } catch (e) {
      console.error('PushSubscription upsert error', e.message)
    }
  }
  console.log(`PushSubscriptions: processed=${items.length}`)
}

async function migrateLegalSections() {
  const items = await mongoose.connection.db.collection('legal_sections').find({}).toArray()
  for (const ls of items) {
    try {
      await prisma.legalSection.upsert({
        where: { key: ls.key },
        create: {
          key: ls.key,
          title: ls.title || '',
          description: ls.description || '',
          items: ensureArray(ls.items),
          updatedBy: ls.updatedBy || '',
        },
        update: {
          title: ls.title || '',
          description: ls.description || '',
          items: ensureArray(ls.items),
          updatedBy: ls.updatedBy || '',
        }
      })
    } catch (e) {
      console.error('LegalSection upsert error', e.message)
    }
  }
  console.log(`LegalSections: processed=${items.length}`)
}

async function main() {
  const mongoUri = process.env.MONGODB_URI
  const hasMongo = !!mongoUri
  const hasPrisma = !!process.env.DATABASE_URL
  if (!hasMongo) {
    console.error('❌ MONGODB_URI não definida')
    process.exit(1)
  }
  if (!hasPrisma) {
    console.error('❌ DATABASE_URL não definida')
    process.exit(1)
  }

  console.log('🔌 Conectando ao MongoDB...')
  await mongoose.connect(mongoUri)
  console.log('✅ MongoDB conectado')

  console.log('🔌 Verificando conexão Prisma/MySQL...')
  await prisma.$connect()
  console.log('✅ Prisma conectado')

  try {
    await migrateUsers()
    await migrateNews()
    await migrateProducts()
    await migrateCollaborators()
    await migrateMemberContent()
    await migrateContacts()
    await migrateSiteConfig()
    await migrateMarketQuotes()
    await migrateActivityLogs()
    await migratePushSubscriptions()
    await migrateLegalSections()
  } finally {
    try { await mongoose.disconnect() } catch {}
    try { await prisma.$disconnect() } catch {}
  }

  console.log('🎉 Migração concluída')
}

main().catch((e) => {
  console.error('Erro na migração:', e)
  process.exit(1)
})
