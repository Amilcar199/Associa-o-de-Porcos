"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Tag, Weight, Calendar, DollarSign, Image as ImageIcon, Save } from 'lucide-react'

export default function NewProductClient() {
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState('AOA')
  const [form, setForm] = useState({
    name: '',
    description: '',
    breed: '',
    age: 0,
    weight: 0,
    price: undefined as number | undefined,
    images: [''],
    videos: [] as string[],
    features: [] as string[],
    healthStatus: 'good' as 'excellent' | 'good' | 'fair',
    vaccinated: false,
    location: '',
    province: '',
    municipality: '',
    customLocation: '',
    tags: [] as string[],
    code: '',
    codeType: 'auto' as 'auto' | 'manual',
  })

  const allowedBreeds = [
    'Landrace','Large White','Duroc','Hampshire','Pietrain','Yorkshire','Chester White','Spotted','Tamworth','Gloucester Old Spots','Mangalitsa','Ossabaw Island Hog','Mulefoot','Caipira','Piau','Moura','Canastra','Cruzado','Outro'
  ]

  const ANGOLA_PROVINCES: Record<string, string[]> = {
    'Bengo': ['Ambriz','Dande','Dembos','Nambuangongo','Pango Aluquém','Outro'],
    'Benguela': ['Benguela','Baía Farta','Balombo','Bocoio','Caimbambo','Catumbela','Chongorói','Cubal','Ganda','Lobito','Outro'],
    'Bié': ['Kuito','Andulo','Camacupa','Catabola','Chinguar','Chitembo','Cuemba','Cunhinga','Nharea','Outro'],
    'Cabinda': ['Cabinda','Belize','Buco-Zau','Cacongo','Outro'],
    'Cuando Cubango': ['Menongue','Calai','Cuangar','Cuchi','Cuito Cuanavale','Dirico','Mavinga','Nancova','Rivungo','Outro'],
    'Cuanza Norte': ['Ndalatando','Ambaca','Banga','Bolongongo','Cambambe','Cazengo','Golungo Alto','Gonguembo','Lucala','Quiculungo','Samba Cajú','Outro'],
    'Cuanza Sul': ['Sumbe','Amboim (Gabela)','Cassongue','Cela (Waku-Kungo)','Conda','Ebo','Libolo','Mussende','Porto Amboim','Quibala','Quilenda','Seles','Outro'],
    'Cunene': ['Ondjiva','Cahama','Cuanhama','Curoca','Cuvelai','Namacunde','Ombadja','Outro'],
    'Huambo': ['Huambo','Bailundo','Cachiungo','Caála','Ekunha','Londuimbali','Longonjo','Mungo','Catchiungo','Tchicala-Tcholoanga','Ucuma','Outro'],
    'Huíla': ['Lubango','Caluquembe','Caconda','Chiange','Chibia','Chicomba','Chipindo','Cuvango','Humpata','Jamba','Matala','Quilengues','Quipungo','Outros'],
    'Luanda': ['Luanda','Belas','Cacuaco','Cazenga','Ícolo e Bengo','Kissama','Quilamba Quiaxi','Talatona','Viana','Outro'],
    'Lunda Norte': ['Dundo','Cambulo','Capenda-Camulemba','Caungula','Chitato','Cuango','Cuilo','Lóvua','Lubalo','Lucapa','Xá-Muteba','Outro'],
    'Lunda Sul': ['Saurimo','Cacolo','Dala','Muconda','Outro'],
    'Malanje': ['Malanje','Cacuso','Calandula','Cambundi-Catembo','Cangandala','Caombo','Cuaba Nzoji','Cunda-Dia-Baze','Kiwaba Nzoji','Luquembo','Marimba','Massango','Mucari','Quela','Quirima','Outro'],
    'Moxico': ['Luena','Alto Zambeze','Bundas','Camanongue','Léua','Luchazes','Cameia','Luau','Moxico','Outro'],
    'Namibe': ['Moçâmedes','Bibala','Camucuio','Tômbwa','Virei','Outro'],
    'Uíge': ['Uíge','Alto Cauale','Ambuíla','Bembe','Buengas','Bungo','Damba','Milunga','Mucaba','Negage','Puri','Quimbele','Quitexe','Sanza Pombo','Songo','Zombo','Outro'],
    'Zaire': ['Mbanza Kongo','Cuimba','Noqui','Nzózi','Soyo','Tomboco','Outro']
  }

  const provinceList = useMemo(() => Object.keys(ANGOLA_PROVINCES).sort().concat('Outro'), [])
  const municipalityList = useMemo(() => {
    if (!form.province || !ANGOLA_PROVINCES[form.province]) return [] as string[]
    return ANGOLA_PROVINCES[form.province]
  }, [form.province])

  useEffect(()=>{
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
          setForm(prev => ({ ...prev, code: (data?.data?.code as string) || '' }));
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
      const imageList = (form.images || []).map(s=>s.trim()).filter(Boolean)
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

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          breed: allowedBreeds.includes(form.breed) ? form.breed : 'Outro',
          images: imageList,
          videos: (form.videos || []).map(s=>s.trim()).filter(Boolean),
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
              <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input value={form.name} onChange={(e)=>setForm(p=>({...p,name:e.target.value}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Suíno Reprodutor Duroc" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Raça</label>
            <select value={form.breed} onChange={(e)=>setForm(p=>({...p,breed:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              <option value="">Selecione...</option>
              {allowedBreeds.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Peso (kg)</label>
            <div className="relative">
              <Weight className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.weight} onChange={(e)=>setForm(p=>({...p,weight:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="80" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Idade (meses)</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.age} onChange={(e)=>setForm(p=>({...p,age:parseInt(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço ({currency})</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input type="number" value={form.price ?? ''} onChange={(e)=>setForm(p=>({...p,price:e.target.value===''?undefined:parseFloat(e.target.value)}))} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="120000" required />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Imagens (uma por linha)</label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea value={(form.images||[]).join('\n')} onChange={(e)=>setForm(p=>({...p,images:e.target.value.split(/\n+/)}))} rows={4} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://imagem1.jpg\nhttps://imagem2.jpg" />
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-700 mb-1">ou Upload local</label>
              <input type="file" accept="image/*" onChange={async (e)=>{
                const file=e.target.files?.[0];
                if(!file) return;
                const fd=new FormData();
                fd.append('file',file);
                const res=await fetch('/api/images/upload',{method:'POST',body:fd});
                if(res.ok){
                  const json=await res.json();
                  setForm(p=>({...p,images:[...(p.images||[]), json.data.url]}));
                } else {
                  alert('Falha no upload da imagem');
                }
              }} className="w-full" />
            </div>
            {(form.images||[]).filter(Boolean).length>0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(form.images||[]).filter(Boolean).slice(0,6).map((url,idx)=>(
                  <img key={idx} src={url} className="w-full h-20 object-cover rounded" alt="Pré-visualização" />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Província</label>
            <select value={form.province} onChange={(e)=>setForm(p=>({...p,province:e.target.value, municipality: ''}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Selecione...</option>
              {provinceList.map(pv => (<option key={pv} value={pv}>{pv}</option>))}
            </select>
            {form.province && form.province !== 'Outro' && (
              <div className="mt-3">
                <label className="block text-sm text-gray-700 mb-1">Município</label>
                <select value={form.municipality} onChange={(e)=>setForm(p=>({...p,municipality:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Selecione...</option>
                  {municipalityList.map(m => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>
            )}
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">Localização personalizada (opcional)</label>
              <input value={form.customLocation} onChange={(e)=>setForm(p=>({...p,customLocation:e.target.value}))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ex.: Viana, Luanda" />
              <p className="text-xs text-gray-500 mt-1">Se informar este campo, ele terá prioridade sobre os seletores.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Vídeos (URLs — uma por linha)</label>
          <textarea value={(form.videos||[]).join('\n')} onChange={(e)=>setForm(p=>({...p,videos:e.target.value.split(/\n+/)}))} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://youtu.be/xyz\nhttps://meuservidor.com/video.mp4" />
          <p className="text-xs text-gray-500 mt-1">Aceita YouTube/Vimeo ou links diretos (MP4/WEBM).</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tipo de Código</label>
            <select
              value={form.codeType}
              onChange={(e) => {
                const newType = e.target.value as 'auto' | 'manual';
                setForm(prev => ({ 
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
                onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
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
              onChange={(e)=>setForm(p=>({...p,healthStatus:e.target.value as 'excellent' | 'good' | 'fair'}))} 
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
              onChange={(e)=>setForm(p=>({...p,vaccinated:e.target.value === 'true'}))} 
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
            onChange={(e)=>setForm(p=>({...p,description:e.target.value}))}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descreva características, manejo, alimentação, etc."
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-60">
            <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}