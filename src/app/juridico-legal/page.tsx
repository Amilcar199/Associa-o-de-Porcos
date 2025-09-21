export const dynamic = 'force-dynamic'
// @ts-nocheck
import React from 'react'
import { cookies, headers } from 'next/headers'
import Link from 'next/link'

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
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">
        {isEn ? 'Legal & Compliance' : 'Jurídico e Legal'}
      </h1>

      {/* Tabs */}
      <div className="not-prose mb-6">
        <div role="tablist" className="flex border-b border-gray-200">
          <Link
            href="/juridico-legal"
            role="tab"
            aria-selected
            className="px-4 py-2 -mb-px border-b-2 border-primary-600 text-primary-700 font-medium"
          >
            {isEn ? 'Overview' : 'Geral'}
          </Link>
          <Link
            href="/juridico-legal/documentacao-de-constituicao"
            role="tab"
            className="px-4 py-2 -mb-px border-b-2 border-transparent text-gray-600 hover:text-primary-700 hover:border-primary-300"
          >
            {isEn ? 'Constitution Documentation' : 'Documentação de constituição'}
          </Link>
          <Link
            href="/juridico-legal/corpo-administrativo"
            role="tab"
            className="px-4 py-2 -mb-px border-b-2 border-transparent text-gray-600 hover:text-primary-700 hover:border-primary-300"
          >
            {isEn ? 'Administrative Body' : 'Corpo administrativo'}
          </Link>
        </div>
      </div>

      <div className="prose prose-green max-w-none">
        <p>
          {isEn
            ? 'Here you can find the main legal and compliance documents of the Association.'
            : 'Aqui você encontra os principais documentos jurídicos e de conformidade da Associação.'}
        </p>

        {/* Conteúdo geral sem documentos específicos */}

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

        {/* A documentação de constituição foi movida para a aba dedicada. */}

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

