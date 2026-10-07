'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, PiggyBank, Heart, Beef, Sprout, PlusCircle } from 'lucide-react'
import FarmRegisterModal from './FarmRegisterModal'
import AngolaSvgMap from './AngolaSvgMap'
import LuandaMunicipalityMap from './LuandaMunicipalityMap'
import { getProvinceMeta } from './angola-map-meta'
import type { ProvinceStats } from '@/types'

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [luandaOpen, setLuandaOpen] = useState(false)

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

  const selectedMeta = selectedId ? getProvinceMeta(selectedId) : undefined
  const selectedStats = selectedMeta
    ? data?.provinces.find((item) => item.province === selectedMeta.dataName)
    : undefined
  const totals = data?.totals

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="container-custom">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
            {isEn ? 'Interactive Map' : 'Mapa Interativo'}
          </span>
          <h3 className="font-heading text-3xl font-bold">
            {isEn ? 'Provinces of Angola' : 'Províncias de Angola'}
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-gray-600">
            {isEn
              ? 'Explore the provinces in one click. Hover a province to see local pig-farming figures, or click it to register a farm.'
              : 'Conheça as províncias e saiba mais sobre a suinocultura em Angola em apenas um clique!'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: isEn ? 'Producers' : 'Produtores', value: totals?.farmersCount ?? '—', icon: Users },
            { label: isEn ? 'Total Pigs' : 'Total de Porcos', value: totals?.totalPigs ?? '—', icon: PiggyBank },
            { label: isEn ? 'Females' : 'Fêmeas', value: totals?.females ?? '—', icon: Heart },
            { label: isEn ? 'For Slaughter' : 'P/ Abate', value: totals?.forSlaughter ?? '—', icon: Beef },
            { label: isEn ? 'For Breeding' : 'P/ Reprodução', value: totals?.forBreeding ?? '—', icon: Sprout },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
              <item.icon size={18} className="mx-auto mb-1 text-primary-600" />
              <div className="text-xl font-bold text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 flex justify-center">
          <button
            type="button"
            onClick={() => openModal(undefined)}
            className="btn-primary inline-flex items-center justify-center"
          >
            <PlusCircle size={18} className="mr-2" aria-hidden />
            {isEn ? 'Register my farm' : 'Cadastrar minha fazenda'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-sm"
        >
          {loading && (
            <div className="flex h-[420px] items-center justify-center">
              <div className="animate-pulse text-sm text-gray-500">{isEn ? 'Loading map...' : 'Carregando mapa...'}</div>
            </div>
          )}
          {error && !loading && (
            <div className="flex h-[320px] items-center justify-center">
              <div className="px-6 text-center text-sm text-red-600">
                <p>{error}</p>
                <button onClick={loadStats} className="mt-2 text-primary-700 underline">
                  {isEn ? 'Try again' : 'Tentar novamente'}
                </button>
              </div>
            </div>
          )}
          {!loading && !error && (luandaOpen ? (
            <LuandaMunicipalityMap isEn={isEn} onBack={() => setLuandaOpen(false)} />
          ) : (
            <AngolaSvgMap
              provinces={data?.provinces}
              isEn={isEn}
              selectedId={selectedId}
              onProvinceClick={(dataName, id) => {
                if (id === 'luanda') {
                  setLuandaOpen(true)
                  setSelectedId(null)
                  setSelectedProvince('Luanda')
                  return
                }
                setSelectedProvince(dataName)
                setSelectedId(id)
              }}
            />
          ))}
        </motion.div>

        {!luandaOpen && selectedMeta && (
          <div className="mx-auto mt-4 max-w-xl rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="mb-2 text-base font-semibold text-gray-900">{selectedMeta.label}</p>
            {selectedStats && selectedStats.farmersCount > 0 ? (
              <ul className="space-y-1">
                <li><strong>{selectedStats.farmersCount}</strong> {isEn ? 'registered producer(s)' : 'produtor(es) cadastrado(s)'}</li>
                <li><strong>{selectedStats.totalPigs}</strong> {isEn ? 'total pigs' : 'porcos no total'}</li>
                <li>{isEn ? 'Females' : 'Fêmeas'}: <strong>{selectedStats.females}</strong></li>
                <li>{isEn ? 'For slaughter' : 'P/ abate'}: <strong>{selectedStats.forSlaughter}</strong></li>
                <li>{isEn ? 'For breeding' : 'P/ reprodução'}: <strong>{selectedStats.forBreeding}</strong></li>
              </ul>
            ) : (
              <p className="text-gray-500">
                {isEn ? 'No producers registered yet in this province.' : 'Nenhum produtor cadastrado nesta província ainda.'}
              </p>
            )}
            <button
              type="button"
              onClick={() => openModal(selectedMeta.dataName)}
              className="mt-3 font-medium text-primary-700 underline hover:text-primary-800"
            >
              {isEn ? 'Register a farm here' : 'Cadastrar fazenda nesta província'}
            </button>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          {luandaOpen
            ? (isEn
              ? 'Hover a municipality to see the producers registered there.'
              : 'Passe o rato sobre um município para ver os produtores cadastrados ali.')
            : (isEn
              ? 'Hover a province to preview the figures. Click Luanda to open its municipalities.'
              : 'Passe o rato sobre uma província para ver os números. Clique em Luanda para ver os municípios.')}
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
