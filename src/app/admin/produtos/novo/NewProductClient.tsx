"use client"

import React from 'react'
// Icons removed to avoid lucide-react export issues
import MediaUploader from '@/components/admin/ui/MediaUploader'

type NewProductForm = {
  name: string
  description: string
  breed: string
  age: number
  weight: number
  price: number | undefined
  pricePerKg?: number
  saleForm?: 'carcaça' | 'vivo'
  images: string[]
  videos: string[]
  features: string[]
  healthStatus: 'excellent' | 'good' | 'fair'
  vaccinated: boolean
  location: string
  province: string
  municipality: string
  customLocation: string
  tags: string[]
  code: string
  codeType: 'auto' | 'manual'
}

export default function NewProductClient() {
  const [loading, setLoading] = React.useState(false)
  const [currency, setCurrency] = React.useState('AOA')
  const initialForm: NewProductForm = {
    name: '',
    description: '',
    breed: '',
    age: 0,
    weight: 0,
    price: undefined as number | undefined,
    pricePerKg: undefined,
    saleForm: undefined,
    images: [''],
    videos: [],
    features: [],
    healthStatus: 'good',
    vaccinated: false,
    location: '',
    province: '',
    municipality: '',
    customLocation: '',
    tags: [],
    code: '',
    codeType: 'auto',
  }
  const [form, setForm] = React.useState(initialForm)

  const allowedBreeds = [
    'Landrace','Large White','Duroc','Hampshire','Pietrain','Yorkshire','Chester White','Spotted','Tamworth','Gloucester Old Spots','Mangalitsa','Ossabaw Island Hog','Mulefoot','Caipira','Piau','Moura','Canastra','Cruzado','Outro'
  ]

  const ANGOLA_PROVINCES: Record<string, string[]> = {
    'Ícolo e Bengo': ['Catete','Quiçama','Calumbo','Cabiri','Cabo Ledo','Bom Jesus','Sequele','Outro'],
    'Luanda': ['Belas','Cacuaco','Cazenga','Luanda','Quilamba-Quiaxi','Talatona','Viana','Outro'],
    'Bengo': ['Ambriz','Bula-Atumba','Dande','Dembos','Nambuangongo','Pango Aluquém','Outro'],
    'Benguela': ['Balombo','Baía Farta','Benguela','Bocoio','Caimbambo','Catumbela','Chongorói','Cubal','Ganda','Lobito','Outro'],
    'Bié': ['Andulo','Camacupa','Catabola','Chinguar','Chitembo','Cuemba','Cunhinga','Cuíto','Nharea','Outro'],
    'Cabinda': ['Belize','Buco-Zau','Cabinda','Cacongo','Outro'],
    'Cuando': ['Calai','Cuangar','Cuchi','Cuito Cuanavale','Dirico','Mavinga','Nancova','Rivungo','Outro'],
    'Cubango': ['Menongue','Outros municípios anteriormente do Cuando-Cubango','Outro'],
    'Cuanza Norte': ['Ambaca','Banga','Bolongongo','Cambambe','Cazengo','Golungo Alto','Gonguembo','Lucala','Quiculungo','Samba Caju','Outro'],
    'Cuanza Sul': ['Amboim','Cassongue','Cela','Conda','Ebo','Libolo','Mussende','Porto Amboim','Quibala','Quilenda','Seles','Sumbe','Outro'],
    'Cunene': ['Cahama','Cuanhama','Curoca','Cuvelai','Namacunde','Ombadja','Outro'],
    'Huambo': ['Bailundo','Caála','Cachiungo','Ecunha','Huambo','Londuimbale','Longonjo','Mungo','Chicala-Choloanga','Chinjenje','Ucuma','Outro'],
    'Huíla': ['Lubango','Cacula','Caluquembe','Chiange','Chibia','Chicomba','Chipindo','Cuvango','Humpata','Jamba','Kuvango','Matala','Quilengues','Quipungo','Outro'],
    'Lunda Norte': ['Cambulo','Capenda-Camulemba','Caungula','Chitato','Cuango','Cuilo','Lóvua','Lubalo','Lucapa','Xá-Muteba','Outro'],
    'Lunda Sul': ['Cacolo','Dala','Muconda','Saurimo','Outro'],
    'Malanje': ['Cacuso','Calandula','Cambundi-Catembo','Cangandala','Caombo','Cunda-Dia-Baze','Luquembo','Malanje','Marimba','Massango','Mucari','Quela','Quirima','Outro'],
    'Moxico': ['Alto Cuito','Camanongue','Cangamba','Cangumbe','Chiúme','Léua','Lucusse','Luena','Lumbala-Nguimbo','Lutembo','Lutuai','Ninda','Outro'],
    'Moxico Oriental': ['Cazombo','Outros municípios que pertenciam ao Moxico','Outro'],
    'Namibe': ['Bibala','Camucuio','Moçâmedes','Tômbua','Virei','Outro'],
    'Uíge': ['Alto Zaza','Ambuíla','Bembe','Buengas','Bungo','Damba','Milunga','Mucaba','Negage','Puri','Quimbele','Quitexe','Sanza Pombo','Songo','Zombo','Outro'],
    'Zaire': ['Cuimba','Mbanza Congo','Nóqui','Nzeto','Soyo','Tomboco','Outro']
  }

  const provinceList = React.useMemo(() => Object.keys(ANGOLA_PROVINCES).sort().concat('Outro'), [])
  const municipalityList = React.useMemo(() => {
    if (!form.province || !ANGOLA_PROVINCES[form.province]) return [] as string[]
    return ANGOLA_PROVINCES[form.province]
  }, [form.province])

  React.useEffect(()=>{
    ;(async()=>{ try { const r = await fetch('/api/admin/config',{cache:'no-store'}); if(r.ok){ const j = await r.json(); setCurrency(j?.data?.currency || 'AOA') } } catch {} })()
  },[])

  const generateAutoCode = async () => {
    if (form.breed) {
      try {
        const response = await fetch('/api/products/generate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ breed: form.breed }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setForm((prev: NewProductForm) => ({ ...prev, code: (data?.data?.code as string) || '' }));
        }
      } catch (error) {
        console.error('Erro ao gerar código:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      // validação simples de imagem
      const imageList = (form.images || []).map((s: string)=>s.trim()).filter(Boolean)
      if (imageList.length === 0) {
        alert('Adicione pelo menos uma imagem (URL ou upload).')
        return
      }

      // Montar localização final
      let finalLocation = ''
      const hasCustom = form.customLocation && form.customLocation.trim().length > 0
      const hasStructured = form.province && form.municipality
      if (hasCustom) {
        finalLocation = form.customLocation.trim()
      } else if (hasStructured) {
        finalLocation = `${form.municipality}, ${form.province}`
      } else if (form.location) {
        // fallback para o campo livre antigo
        finalLocation = form.location
      }
      if (!finalLocation) {
        alert('Informe a localização (selecione província/município ou insira personalizada).')
        return
      }

      // validação: exigir pelo menos um preço (cabeça OU kg)
      const hasHeadPrice = typeof form.price === 'number' && form.price > 0
      const hasKgPrice = typeof form.pricePerKg === 'number' && form.pricePerKg > 0
      if (!hasHeadPrice && !hasKgPrice) {
        alert('Informe ao menos um preço: por cabeça ou por kg.')
        return
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          breed: allowedBreeds.includes(form.breed) ? form.breed : 'Outro',
          images: imageList,
          videos: (form.videos || []).map((s: string)=>s.trim()).filter(Boolean),
          isAvailable: true,
          code: form.code,
          location: finalLocation,
        }),
      })
      if (!res.ok) {
        try { const j = await res.json(); alert(j?.error || 'Falha ao salvar') } catch { alert('Falha ao salvar') }
        return
      }
      setForm({
        name: '', description: '', breed: '', age: 0, weight: 0, price: undefined,
        pricePerKg: undefined, saleForm: undefined,
        images: [''], videos: [], features: [], healthStatus: 'good', vaccinated: false, location: '', province: '', municipality: '', customLocation: '', tags: [],
        code: '', codeType: 'auto'
      })
      alert('Produto criado com sucesso')
    } catch (err) {
      alert('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Produto</h1>
        <p className="text-gray-600 mt-1">Preencha os dados do novo produto</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome</label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-3" aria-hidden>🏷️</span>
              <input value={form.name} onChange={(e)=>setForm((p: NewProductForm)=>({...p,name:e.target.value}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Suíno Reprodutor Duroc" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Raça</label>
            <select value={form.breed} onChange={(e)=>setForm((p: NewProductForm)=>({...p,breed:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              <option value="">Selecione...</option>
              {allowedBreeds.map((b: string) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-3" aria-hidden>⚖️</span>
              <input type="number" value={form.weight} onChange={(e)=>setForm((p: NewProductForm)=>({...p,weight:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="80" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Idade (meses)</label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-3" aria-hidden>📅</span>
              <input type="number" value={form.age} onChange={(e)=>setForm((p: NewProductForm)=>({...p,age:parseInt(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço ({currency})</label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-3" aria-hidden>💵</span>
              <input type="number" value={form.price ?? ''} onChange={(e)=>setForm((p: NewProductForm)=>({...p,price:e.target.value===''?undefined:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Opcional" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço por kg ({currency})</label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-3" aria-hidden>⚖️</span>
              <input type="number" step="0.01" value={form.pricePerKg ?? ''} onChange={(e)=>setForm((p: NewProductForm)=>({...p,pricePerKg:e.target.value===''?undefined:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Opcional" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Condição de venda</label>
            <select value={form.saleForm || ''} onChange={(e)=>setForm((p: NewProductForm)=>({...p, saleForm: (e.target.value || undefined) as any}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Selecione...</option>
              <option value="vivo">Vivo</option>
              <option value="carcaça">Carcaça</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <MediaUploader
              label="Imagens"
              accept="image/*"
              maxSizeBytes={5*1024*1024}
              uploadEndpoint="/api/images/upload"
              values={form.images || []}
              onChange={(urls)=>setForm((p: NewProductForm)=>({...p, images: urls}))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Província</label>
            <select value={form.province} onChange={(e)=>setForm((p: NewProductForm)=>({...p,province:e.target.value, municipality: ''}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Selecione...</option>
              {provinceList.map((pv: string) => (<option key={pv} value={pv}>{pv}</option>))}
            </select>
            {form.province && form.province !== 'Outro' && (
              <div className="mt-3">
                <label className="block text-sm text-gray-700 mb-1">Município</label>
                <select value={form.municipality} onChange={(e)=>setForm((p: NewProductForm)=>({...p,municipality:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Selecione...</option>
                  {municipalityList.map((m: string) => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            )}
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">Localização personalizada (opcional)</label>
              <input value={form.customLocation} onChange={(e)=>setForm((p: NewProductForm)=>({...p,customLocation:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Viana, Luanda" />
              <p className="text-xs text-gray-500 mt-1">Se informar este campo, ele terá prioridade sobre os seletores.</p>
            </div>
          </div>
        </div>

        <div>
          <MediaUploader
            label="Vídeos"
            accept="video/*"
            maxSizeBytes={100*1024*1024}
            uploadEndpoint="/api/videos/upload"
            values={form.videos || []}
            onChange={(urls)=>setForm((p: NewProductForm)=>({...p, videos: urls}))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tipo de Código</label>
            <select
              value={form.codeType}
              onChange={(e) => {
                const newType = e.target.value as 'auto' | 'manual';
                setForm((prev: NewProductForm) => ({ 
                  ...prev, 
                  codeType: newType,
                  code: newType === 'auto' ? '' : prev.code
                }));
                if (newType === 'auto') {
                  generateAutoCode();
                }
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="auto">Gerar Automaticamente</option>
              <option value="manual">Código Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-1">Código do Produto</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((prev: NewProductForm) => ({ ...prev, code: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={form.codeType === 'auto' ? 'Código será gerado automaticamente' : 'Ex.: DUROC-2024-001'}
                required
                disabled={form.codeType === 'auto'}
              />
              {form.codeType === 'auto' && (
                <button
                  type="button"
                  onClick={generateAutoCode}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!form.breed}
                >
                  Gerar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Status de Saúde *</label>
            <select 
              value={form.healthStatus} 
              onChange={(e)=>setForm((p: NewProductForm)=>({...p,healthStatus:e.target.value as 'excellent' | 'good' | 'fair'}))} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
              required
            >
              <option value="excellent">Excelente</option>
              <option value="good">Bom</option>
              <option value="fair">Regular</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Status de Vacinação *</label>
            <select 
              value={form.vaccinated.toString()} 
              onChange={(e)=>setForm((p: NewProductForm)=>({...p,vaccinated:e.target.value === 'true'}))} 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" 
              required
            >
              <option value="true">Vacinado</option>
              <option value="false">Não Vacinado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e)=>setForm((p: NewProductForm)=>({...p,description:e.target.value}))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descreva características, manejo, alimentação, etc."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
            <span className="w-4 h-4 mr-2" aria-hidden>💾</span> {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}