'use client'

import React from 'react'

type SaleForm = 'carcaça' | 'vivo'
type Unit = 'kg' | 'head'

type SummaryRes = {
  success: boolean
  data?: {
    unit: Unit
    current: { avg: number | null, count: number }
    variation: { daily: number | null, weekly: number | null, monthly: number | null }
    officialRef: number | null
    usedFallback: boolean
    effectiveDate: string
  }
}

type MetaRes = { success: boolean; data?: { regions?: string[]; breeds?: string[] } }

type RecordItem = {
  id: string
  name?: string
  date: string
  region?: string
  breed?: string
  unit: Unit
  value: number | null
  saleForm: SaleForm | null
  outOfBand?: boolean
}

export default function AdminBolsaClient(){
  const [saleForm, setSaleForm] = React.useState<SaleForm>('carcaça')
  const unit: Unit = saleForm === 'vivo' ? 'head' : 'kg'
  const [region, setRegion] = React.useState('')
  const [breed, setBreed] = React.useState('')
  const [regionsList, setRegionsList] = React.useState<string[]>([])
  const [breedsList, setBreedsList] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [summary, setSummary] = React.useState<SummaryRes['data'] | null>(null)
  const [records, setRecords] = React.useState<RecordItem[]>([])
  const [editing, setEditing] = React.useState<Record<string, number | ''>>({})
  const [savingRow, setSavingRow] = React.useState<string | null>(null)
  const [error, setError] = React.useState('')

  React.useEffect(()=>{ (async()=>{
    try {
      const meta: MetaRes = await (await fetch('/api/market/meta', { cache: 'no-store' })).json()
      setRegionsList(meta?.data?.regions || [])
      setBreedsList(meta?.data?.breeds || [])
    } catch {}
  })() }, [])

  const load = React.useCallback(async ()=>{
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams()
      p.set('saleForm', saleForm)
      if (region) p.set('region', region)
      if (breed) p.set('breed', breed)
      p.set('unit', unit)
      const [sumRes, recRes] = await Promise.all([
        fetch(`/api/market/summary?${p.toString()}`, { cache: 'no-store' }),
        fetch(`/api/market/records?${p.toString()}&limit=200&cleanOutliers=false`, { cache: 'no-store' })
      ])
      const sumJson: SummaryRes = await sumRes.json()
      setSummary(sumJson?.data || null)
      const recJson: any = await recRes.json()
      const recs: RecordItem[] = recJson?.data?.records || []
      setRecords(recs)
    } catch (e) {
      setError('Falha ao carregar dados')
    } finally { setLoading(false) }
  }, [saleForm, region, breed, unit])

  React.useEffect(()=>{ load() }, [load])

  const startEdit = (row: RecordItem) => {
    setEditing((prev)=>({ ...prev, [row.id]: row.value ?? '' }))
  }

  const cancelEdit = (rowId: string) => {
    setEditing(prev => { const n = { ...prev }; delete n[rowId]; return n })
  }

  const saveEdit = async (row: RecordItem) => {
    const newValRaw = editing[row.id]
    const newVal = typeof newValRaw === 'string' ? (newValRaw === '' ? NaN : Number(newValRaw)) : newValRaw
    if (!isFinite(newVal)) { setError('Valor inválido'); return }
    setSavingRow(row.id); setError('')
    try {
      // Fetch full product to satisfy required fields in PUT
      const prodRes = await fetch(`/api/products/${row.id}`, { cache: 'no-store' })
      const prodJson: any = await prodRes.json()
      const prod = prodJson?.data
      if (!prod) { setError('Produto não encontrado'); setSavingRow(null); return }

      const body: any = {
        name: prod.name,
        description: prod.description || '',
        breed: prod.breed,
        age: prod.age ?? null,
        weight: prod.weight ?? null,
        saleForm: row.saleForm || saleForm,
        features: prod.features || [],
        healthStatus: prod.healthStatus || 'healthy',
        vaccinated: typeof prod.vaccinated === 'boolean' ? prod.vaccinated : false,
        location: prod.location || '',
        tags: prod.tags || [],
        images: prod.images || [],
        videos: prod.videos || []
      }
      if (unit === 'kg') {
        body.pricePerKg = newVal
        body.price = prod.price ?? undefined
      } else {
        body.price = newVal
        body.pricePerKg = prod.pricePerKg ?? undefined
      }

      const put = await fetch(`/api/products/${row.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      if (!put.ok) {
        const j = await put.json().catch(()=>({}))
        setError(j?.error || 'Falha ao salvar')
      } else {
        // update UI
        setRecords(prev => prev.map(r => r.id === row.id ? { ...r, value: newVal } : r))
        cancelEdit(row.id)
      }
    } catch (e) {
      setError('Erro ao salvar')
    } finally { setSavingRow(null) }
  }

  const fmt = (v: number | null | undefined) => v == null ? '—' : new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 2 }).format(v)

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-xs text-gray-600">
            Forma de venda
            <select value={saleForm} onChange={e=>setSaleForm(e.target.value as SaleForm)} className="mt-1 w-full px-3 py-2 border rounded-lg">
              <option value="carcaça">Carcaça (AOA/kg)</option>
              <option value="vivo">Vivo (AOA/cabeça)</option>
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Região
            <select value={region} onChange={e=>setRegion(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
              <option value="">Todas</option>
              {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-600">
            Raça
            <select value={breed} onChange={e=>setBreed(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
              <option value="">Todas</option>
              {breedsList.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button onClick={load} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 w-full">Aplicar</button>
          </div>
        </div>
      </div>

      {/* Sumário */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500">Preço médio atual ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{fmt(summary?.current?.avg ?? null)}</div>
          <div className="text-xs text-gray-500">Base {summary?.current?.count || 0} registos</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500">Variação diária</div>
          <div className="text-xl font-semibold text-gray-900 mt-1">{summary?.variation?.daily == null ? '—' : `${summary!.variation!.daily!.toFixed(2)}%`}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-gray-500">Referência oficial</div>
          <div className="text-xl font-semibold text-gray-900 mt-1">{fmt(summary?.officialRef ?? null)}</div>
        </div>
      </div>

      {/* Tabela Registos */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold text-gray-900">Registos ({records.length})</div>
          {loading && <div className="text-sm text-gray-500">Carregando...</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Região</th>
                <th className="px-3 py-2 text-left">Raça</th>
                <th className="px-3 py-2 text-left">Forma</th>
                <th className="px-3 py-2 text-left">Valor ({unit === 'kg' ? 'AOA/kg' : 'AOA/cabeça'})</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r)=>{
                const isEditing = Object.prototype.hasOwnProperty.call(editing, r.id)
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{new Date(r.date).toLocaleString('pt-AO')}</td>
                    <td className="px-3 py-2">{r.region || '—'}</td>
                    <td className="px-3 py-2">{r.breed || '—'}</td>
                    <td className="px-3 py-2">{r.saleForm || saleForm}</td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-32 px-2 py-1 border rounded"
                          value={editing[r.id] as any}
                          onChange={e=>setEditing(prev=>({ ...prev, [r.id]: e.target.value }))}
                        />
                      ) : (
                        <span className={r.outOfBand ? 'text-red-600 font-semibold' : ''}>{fmt(r.value)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{r.outOfBand ? <span className="text-red-600">Fora da banda</span> : <span className="text-gray-500">—</span>}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {!isEditing ? (
                        <button onClick={()=>startEdit(r)} className="px-2 py-1 text-primary-700 hover:bg-primary-50 rounded">Editar</button>
                      ) : (
                        <>
                          <button disabled={savingRow===r.id} onClick={()=>saveEdit(r)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{savingRow===r.id ? 'Salvando...' : 'Salvar'}</button>
                          <button onClick={()=>cancelEdit(r.id)} className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded">Cancelar</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {records.length===0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Nenhum registo para os filtros selecionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  )
}

