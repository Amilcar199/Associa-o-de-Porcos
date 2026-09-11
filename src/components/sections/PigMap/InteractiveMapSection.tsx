'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { MapPin, Users, PiggyBank, UserRound, Beef, Sprout, PlusCircle } from 'lucide-react'
import FarmRegisterModal from './FarmRegisterModal'
import type { ProvinceStats } from '@/types'

// O mapa usa Leaflet, que depende de `window`. Deve ser carregado só no cliente.
const PigFarmMap = dynamic(() => import('./PigFarmMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-2xl">
      <div className="animate-pulse text-gray-400 text-sm">Carregando mapa...</div>
    </div>
  ),
})

interface InteractiveMapSectionProps {
  isEn?: boolean
}

interface StatsResponse {
  provinces: ProvinceStats[]
  totals: {
    farmersCount: number
    totalPigs: number
    females: number
    forSlaughter: number
    forBreeding: number
  }
}

export default function InteractiveMapSection({ isEn = false }: InteractiveMapSectionProps) {
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/farms/stats', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.success) {
        setData(json.data)
      } else {
        setError(json.error || (isEn ? 'Failed to load map data.' : 'Falha ao carregar dados do mapa.'))
      }
    } catch {
      setError(isEn ? 'Network error while loading map data.' : 'Erro de rede ao carregar dados do mapa.')
    } finally {
      setLoading(false)
    }
  }, [isEn])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const openModal = (province?: string) => {
    setSelectedProvince(province)
    setModalOpen(true)
  }

  const totals = data?.totals

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
              {isEn ? 'Interactive Map' : 'Mapa Interativo'}
            </span>
            <h3 className="text-3xl font-heading font-bold">
              {isEn ? 'Pig Farming Across Angola' : 'Suinocultura em Angola'}
            </h3>
            <p className="text-gray-600 mt-2 max-w-2xl">
              {isEn
                ? 'Explore aggregated pig-farming data by province. Click a marker to see local statistics, or register your own farm to appear on the map.'
                : 'Explore dados agregados de suinocultura por província. Clique num marcador para ver as estatísticas locais, ou cadastre a sua fazenda para aparecer no mapa.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal(undefined)}
            className="btn-primary inline-flex items-center justify-center shrink-0"
          >
            <PlusCircle size={18} className="mr-2" aria-hidden />
            {isEn ? 'Register my farm' : 'Cadastrar minha fazenda'}
          </button>
        </div>

        {/* Totais agregados */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: isEn ? 'Producers' : 'Produtores', value: totals?.farmersCount ?? '—', icon: Users },
            { label: isEn ? 'Total Pigs' : 'Total de Porcos', value: totals?.totalPigs ?? '—', icon: PiggyBank },
            { label: isEn ? 'Females' : 'Fêmeas', value: totals?.females ?? '—', icon: UserRound },
            { label: isEn ? 'For Slaughter' : 'P/ Abate', value: totals?.forSlaughter ?? '—', icon: Beef },
            { label: isEn ? 'For Breeding' : 'P/ Reprodução', value: totals?.forBreeding ?? '—', icon: Sprout },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center">
              <item.icon size={18} className="mx-auto text-primary-600 mb-1" />
              <div className="text-xl font-bold text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative h-[420px] lg:h-[520px] rounded-2xl overflow-hidden shadow border border-gray-100"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[500]">
              <div className="animate-pulse text-gray-500 text-sm">{isEn ? 'Loading map...' : 'Carregando mapa...'}</div>
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-[500]">
              <div className="text-center text-sm text-red-600 px-6">
                <p>{error}</p>
                <button onClick={loadStats} className="mt-2 underline text-primary-700">
                  {isEn ? 'Try again' : 'Tentar novamente'}
                </button>
              </div>
            </div>
          )}
          {data && (
            <PigFarmMap provinces={data.provinces} isEn={isEn} onRegisterClick={openModal} />
          )}
        </motion.div>

        <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-700/60 border border-primary-700" />
            {isEn ? 'Province with registered producers' : 'Província com produtores cadastrados'}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400/40 border border-gray-400" />
            {isEn ? 'No registrations yet' : 'Sem cadastros ainda'}
          </span>
        </div>

        <p className="mt-3 text-xs text-gray-400 inline-flex items-center gap-1">
          <MapPin size={12} /> {isEn ? 'Marker positions are approximate provincial centroids.' : 'As posições dos marcadores são centróides aproximados das províncias.'}
        </p>
      </div>

      <FarmRegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isEn={isEn}
        defaultProvince={selectedProvince}
        onRegistered={loadStats}
      />
    </div>
  )
}
