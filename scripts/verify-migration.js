#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function countAll() {
  const [users, news, products, collaborators, memberContent, contacts, siteConfig, marketQuotes, activityLogs, pushSubscriptions, legalSections] = await Promise.all([
    prisma.user.count(),
    prisma.news.count(),
    prisma.product.count(),
    prisma.collaborator.count(),
    prisma.memberContent.count(),
    prisma.contact.count(),
    prisma.siteConfig.count(),
    prisma.marketQuote.count(),
    prisma.activityLog.count(),
    prisma.pushSubscription.count(),
    prisma.legalSection.count(),
  ])

  console.table({ users, news, products, collaborators, memberContent, contacts, siteConfig, marketQuotes, activityLogs, pushSubscriptions, legalSections })
}

countAll().finally(() => prisma.$disconnect())
