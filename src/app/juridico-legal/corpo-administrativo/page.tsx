// @ts-nocheck
export const dynamic = 'force-dynamic'
import React from 'react'
import { cookies, headers } from 'next/headers'

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
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-6">
        {section?.title || (isEn ? 'Administrative Body' : 'Corpo administrativo')}
      </h1>
      {section?.description && (
        <p className="text-gray-700 mb-4">{section.description}</p>
      )}

      <div className="not-prose grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(section?.items || []).map((it:any, idx:number)=> (
          <figure key={it.url+idx} className="bg-white border rounded-lg overflow-hidden">
            <img src={it.url} alt={it.title || `doc-${idx+1}`} className="w-full h-48 object-cover" />
            {(it.title || it.description) && (
              <figcaption className="p-3">
                {it.title && (<div className="font-medium text-gray-900">{it.title}</div>)}
                {it.description && (<div className="text-sm text-gray-600">{it.description}</div>)}
              </figcaption>
            )}
          </figure>
        ))}
        {(section?.items || []).length === 0 && (
          <p className="col-span-full text-gray-600">{isEn ? 'No documents yet.' : 'Ainda não há documentos.'}</p>
        )}
      </div>
    </section>
  )
}

