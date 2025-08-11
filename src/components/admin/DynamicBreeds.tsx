'use client'

import { useEffect, useState } from 'react'

export default function DynamicBreeds(){
  const [breeds, setBreeds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load=async()=>{
      try{
        const res = await fetch('/api/products?limit=1000')
        const list: any[] = res.ok ? (await res.json()).data || [] : []
        const set = Array.from(new Set(list.map((p:any)=>p.breed).filter(Boolean)))
        setBreeds(set)
      } finally { setLoading(false) }
    }
    load()
  },[])

  if (loading) return <div>Carregando raças...</div>
  if (breeds.length===0) return <div className="text-gray-500">Nenhuma raça encontrada.</div>
  return (
    <ul className="list-disc pl-6 text-gray-800 space-y-1">
      {breeds.map(b=> <li key={b}>{b}</li>)}
    </ul>
  )
}