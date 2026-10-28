// @ts-nocheck
export const dynamic = 'force-dynamic'
import React from 'react'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { headers } from 'next/headers'
import dynamicImport from 'next/dynamic'
import PageHeader from '@/components/ui/PageHeader'
import LegalTabs from '@/components/ui/LegalTabs'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Constitution Documentation' : 'Documentação de constituição',
    description: isEn
      ? 'Browse the Association’s constitution documents.'
      : 'Consulte os documentos de constituição da Associação.'
  }
}

export default async function ConstitutionDocsPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')

  // Load public folder images
  const publicUrls = (() => {
    try {
      const docsDir = path.join(process.cwd(), 'public', 'Conteudos Suinos', 'pdf_paginas_png')
      const fileNames: string[] = fs
        .readdirSync(docsDir)
        .filter((name) => /(\.png|jpe?g|webp)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      const baseUrl = '/Conteudos%20Suinos/pdf_paginas_png'
      return fileNames.map((n) => `${baseUrl}/${encodeURIComponent(n)}`)
    } catch {
      return [] as string[]
    }
  })()

  // Load DB-driven content and append to public
  let dbUrls: string[] = []
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'assuino.com'
    const baseUrl = `${protocol}://${host}`
    const res = await fetch(`${baseUrl}/api/legal-content`, { cache: 'no-store' })
    const j = res.ok ? await res.json() : { data: [] }
    const section = (j?.data || []).find((s:any)=>s.key==='constitution')
    if (section && Array.isArray(section.items)) {
      dbUrls = section.items.map((it:any)=>it.url).filter(Boolean)
    }
  } catch {}

  // Merge public + db (keep order, dedupe by URL)
  const seen = new Set<string>()
  const urls = [...publicUrls, ...dbUrls].filter(u => {
    if (!u || seen.has(u)) return false
    seen.add(u)
    return true
  })

  return (
    <>
      <PageHeader
        eyebrow={isEn ? 'Legal & Compliance' : 'Jurídico e Legal'}
        title={isEn ? 'Constitution Documentation' : 'Documentação de constituição'}
        description={isEn
          ? 'Click an image to open the full file.'
          : 'Clique numa imagem para abrir o ficheiro completo.'}
      />

      <section className="container-custom py-10 md:py-12">
        <LegalTabs active="constituicao" isEn={isEn} className="mb-8" />

        {urls.length > 0 ? (
          <DocsGrid urls={urls} />
        ) : (
          // Fallback: load from assets via client-side context if public folder is empty
          <ConstitutionDocsFromAssets />
        )}
      </section>
    </>
  )
}

function DocsGrid({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) {
    return (
      <p className="text-gray-600">
        Nenhuma imagem encontrada em <code>public/Conteudos Suinos/pdf_paginas_png</code>.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {urls.map((src) => (
        <div
          key={src}
          className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-shadow hover:shadow-md"
        >
          <img src={src} alt="Documento de constituição" className="h-full w-full object-cover" />
          <a href={src} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
            <span className="sr-only">Abrir documento</span>
          </a>
        </div>
      ))}
    </div>
  )
}

const ConstitutionDocsFromAssets = dynamicImport(() => import('../ConstitutionDocsClient'), { ssr: false })

