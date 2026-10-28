// @ts-nocheck
export const dynamic = 'force-dynamic'
import React from 'react'
import { cookies, headers } from 'next/headers'
import PageHeader from '@/components/ui/PageHeader'
import LegalTabs from '@/components/ui/LegalTabs'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Administrative Body' : 'Corpo administrativo',
    description: isEn ? 'Administrative members and documents.' : 'Membros e documentos do corpo administrativo.'
  }
}

async function getLegal() {
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'assuino.com'
    const baseUrl = `${protocol}://${host}`
    const res = await fetch(`${baseUrl}/api/legal-content`, { cache: 'no-store' })
    const j = res.ok ? await res.json() : { data: [] }
    return (j?.data || []).find((s:any)=>s.key==='admin-body') || { title:'', description:'', items: [] }
  } catch {
    return { title:'', description:'', items: [] }
  }
}

export default async function AdminBodyPage(){
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const section: any = await getLegal()

  return (
    <>
      <PageHeader
        eyebrow={isEn ? 'Legal & Compliance' : 'Jurídico e Legal'}
        title={section?.title || (isEn ? 'Administrative Body' : 'Corpo administrativo')}
        description={section?.description || (isEn ? 'Members and documents of the administrative body.' : 'Membros e documentos do corpo administrativo.')}
      />

      <section className="container-custom py-10 md:py-12">
        <LegalTabs active="corpo" isEn={isEn} className="mb-8" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(section?.items || []).map((it:any, idx:number)=> (
            <figure key={it.url+idx} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <img src={it.url} alt={it.title || `doc-${idx+1}`} className="h-48 w-full object-cover" />
              {(it.title || it.description) && (
                <figcaption className="p-4">
                  {it.title && (<div className="font-heading font-semibold text-gray-900">{it.title}</div>)}
                  {it.description && (<div className="mt-1 text-sm text-gray-600">{it.description}</div>)}
                </figcaption>
              )}
            </figure>
          ))}
          {(section?.items || []).length === 0 && (
            <p className="col-span-full text-gray-600">{isEn ? 'No documents yet.' : 'Ainda não há documentos.'}</p>
          )}
        </div>
      </section>
    </>
  )
}

