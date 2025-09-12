// @ts-nocheck
import React from 'react'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import dynamic from 'next/dynamic'

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

  // Prefer public folder if available (served as static files)
  const docsDir = path.join(process.cwd(), 'public', 'Conteudos Suinos', 'pdf_paginas_png')
  let fileNames: string[] = []
  try {
    fileNames = fs
      .readdirSync(docsDir)
      .filter((name) => /(\.png|jpe?g|webp)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  } catch {}
  const baseUrl = '/Conteudos%20Suinos/pdf_paginas_png'
  const urls = fileNames.map((n) => `${baseUrl}/${encodeURIComponent(n)}`)

  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">
        {isEn ? 'Constitution Documentation' : 'Documentação de constituição'}
      </h1>

      <div className="prose prose-green max-w-none">
        <p>
          {isEn
            ? 'Click an image to open the full file.'
            : 'Clique numa imagem para abrir o ficheiro completo.'}
        </p>

        {urls.length > 0 ? (
          <DocsGrid urls={urls} />
        ) : (
          // Fallback: load from assets via client-side context if public folder is empty
          <ConstitutionDocsFromAssets />
        )}
      </div>
    </section>
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
    <div className="not-prose">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {urls.map((src) => (
          <div key={src} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img src={src} alt="Documento de constituição" className="w-full h-full object-cover" />
            <a href={src} target="_blank" rel="noopener noreferrer" className="absolute inset-0 group">
              <span className="sr-only">Abrir documento</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

const ConstitutionDocsFromAssets = dynamic(() => import('../ConstitutionDocsClient'), { ssr: false })

