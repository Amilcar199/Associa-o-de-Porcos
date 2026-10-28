export const dynamic = 'force-dynamic'
// @ts-nocheck
import React from 'react'
import { cookies, headers } from 'next/headers'
import PageHeader from '@/components/ui/PageHeader'
import LegalTabs from '@/components/ui/LegalTabs'

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
    const host = h.get('host') || 'assuino.com'
    const baseUrl = `${protocol}://${host}`
    const cfgRes = await fetch(`${baseUrl}/api/config`, { cache: 'no-store' })
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
    <>
      <PageHeader
        eyebrow={isEn ? 'Institutional' : 'Institucional'}
        title={isEn ? 'Legal & Compliance' : 'Jurídico e Legal'}
        description={isEn
          ? 'Statutes, founding documents and the policies of the association.'
          : 'Estatutos, documentos de constituição e as políticas da associação.'}
      />

      <section className="container-custom py-10 md:py-12">
        <LegalTabs active="geral" isEn={isEn} className="mb-8" />

        <div className="prose prose-green max-w-3xl">
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

          <h2>{isEn ? 'Contact for Legal Matters' : 'Contato para Assuntos Jurídicos'}</h2>
          <p>
            {isEn
              ? 'For legal requests, contact us at '
              : 'Para requerimentos jurídicos, contacte-nos em '}
            <a className="text-primary-700 hover:underline" href={`mailto:${siteConfig?.contactEmail || 'Paulobaptista18@hotmail.com'}`}>
              {siteConfig?.contactEmail || 'Paulobaptista18@hotmail.com'}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}

