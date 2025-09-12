import { cookies, headers } from 'next/headers'
import fs from 'fs'
import path from 'path'
import dynamic from 'next/dynamic'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Legal & Compliance' : 'Jurídico e Legal',
    description: isEn ? 'Documents and compliance information for the Association.' : 'Documentos e informações de conformidade da Associação.'
  }
}

async function getSiteConfig() {
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const cfgRes = await fetch(`${baseUrl}/api/admin/config`, { cache: 'no-store' })
    const cfgJson = cfgRes.ok ? await cfgRes.json() : { data: {} }
    return cfgJson?.data || {}
  } catch {
    return {}
  }
}

export default async function LegalCompliancePage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const siteConfig: any = await getSiteConfig()
  const docsDir = path.join(process.cwd(), 'public', 'Conteudos Suinos', 'pdf_paginas_png')
  let fileNames: string[] = []
  try {
    fileNames = fs
      .readdirSync(docsDir)
      .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
  } catch {}
  const baseUrl = '/Conteudos%20Suinos/pdf_paginas_png'
  const docUrls = fileNames.map((n) => `${baseUrl}/${encodeURIComponent(n)}`)
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">
        {isEn ? 'Legal & Compliance' : 'Jurídico e Legal'}
      </h1>

      <div className="prose prose-green max-w-none">
        <p>
          {isEn
            ? 'Here you can find the main legal and compliance documents of the Association.'
            : 'Aqui você encontra os principais documentos jurídicos e de conformidade da Associação.'}
        </p>

        <h2>{isEn ? 'Institutional Documents' : 'Documentos Institucionais'}</h2>
        <ul>
          <li>
            <a className="text-primary-700 hover:underline" href="#">
              {isEn ? 'Statute (PDF)' : 'Estatuto (PDF)'}
            </a>
          </li>
          <li>
            <a className="text-primary-700 hover:underline" href="#">
              {isEn ? 'Internal Regulations (PDF)' : 'Regulamento Interno (PDF)'}
            </a>
          </li>
          <li>
            <a className="text-primary-700 hover:underline" href="#">
              {isEn ? 'Code of Ethics (PDF)' : 'Código de Ética (PDF)'}
            </a>
          </li>
        </ul>

        <h2>{isEn ? 'Policies' : 'Políticas'}</h2>
        <ul>
          <li>
            <a className="text-primary-700 hover:underline" href="/privacidade">
              {isEn ? 'Privacy Policy' : 'Política de Privacidade'}
            </a>
          </li>
          <li>
            <a className="text-primary-700 hover:underline" href="/termos">
              {isEn ? 'Terms of Use' : 'Termos de Uso'}
            </a>
          </li>
          <li>
            <a className="text-primary-700 hover:underline" href="/cookies">
              {isEn ? 'Cookie Policy' : 'Política de Cookies'}
            </a>
          </li>
        </ul>

        <h2>{isEn ? 'Constitution Documentation' : 'Documentação de constituição'}</h2>
        <p>
          {isEn
            ? 'Below are the constitution-related documents. Click an image to open the full file.'
            : 'Abaixo estão os documentos de constituição. Clique numa imagem para abrir o ficheiro completo.'}
        </p>

        {/* Grid of images from public/Conteudos Suinos/pdf_paginas_png */}
        {docUrls.length > 0 ? (
          <DocsGrid urls={docUrls} />
        ) : (
          // Fallback: load from assets via client-side context if public folder is empty
          <ConstitutionDocsFromAssets />
        )}

        <h2>{isEn ? 'Contact for Legal Matters' : 'Contato para Assuntos Jurídicos'}</h2>
        <p>
          {isEn
            ? 'For legal requests, contact us at '
            : 'Para requerimentos jurídicos, contacte-nos em '}
          <a className="text-primary-700 hover:underline" href={`mailto:${siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}`}>
            {siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}
          </a>
          .
        </p>
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

const ConstitutionDocsFromAssets = dynamic(() => import('./ConstitutionDocsClient'), { ssr: false })

