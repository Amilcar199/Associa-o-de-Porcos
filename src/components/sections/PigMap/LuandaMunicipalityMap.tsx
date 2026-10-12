'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  LUANDA_MUNICIPALITIES,
  LUANDA_MUNICIPALITIES_VIEWBOX,
  municipalityIdFor,
  type MapProducer,
} from './luanda-municipalities'
import {
  MUNICIPALITIES_BY_PROVINCE,
  layoutMunicipalities,
  matchMunicipalityId,
  type MunicipalityShape,
} from './province-municipalities'

const BASE_FILL = '#ffa500'
const HOVER_FILL = '#D7181E'

interface TooltipState {
  id: string
  left: number
  top: number
  ready: boolean
}

interface LuandaMunicipalityMapProps {
  province?: string
  isEn?: boolean
  onBack: () => void
}

function labelLines(label: string) {
  if (label.length <= 14) return [label]
  const words = label.split(' ')
  if (words.length < 2) return [label]
  let best = [label]
  let bestGap = Number.POSITIVE_INFINITY
  for (let index = 1; index < words.length; index += 1) {
    const left = words.slice(0, index).join(' ')
    const right = words.slice(index).join(' ')
    const gap = Math.abs(left.length - right.length)
    if (gap < bestGap) {
      bestGap = gap
      best = [left, right]
    }
  }
  return best
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export default function LuandaMunicipalityMap({ province = 'Luanda', isEn = false, onBack }: LuandaMunicipalityMapProps) {
  const isLuanda = province === 'Luanda'
  const generated = isLuanda ? null : layoutMunicipalities(MUNICIPALITIES_BY_PROVINCE[province] || [])
  const municipalities: MunicipalityShape[] = isLuanda ? LUANDA_MUNICIPALITIES : generated?.items || []
  const viewBox = isLuanda ? LUANDA_MUNICIPALITIES_VIEWBOX : generated?.viewBox || '0 0 100 100'
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [producers, setProducers] = useState<MapProducer[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    let cancel = false

    async function load() {
      setLoading(true)
      const collected: MapProducer[] = []
      try {
        let page = 1
        let pages = 1
        while (page <= pages && page <= 20) {
          const res = await fetch(`/api/farms?province=${encodeURIComponent(province)}&limit=100&page=${page}`, { cache: 'no-store' })
          const json = await res.json()
          if (!res.ok) break
          const batch = Array.isArray(json.data) ? json.data : []
          collected.push(...batch.map((farm: MapProducer) => ({
            producerName: farm.producerName,
            farmName: farm.farmName,
            municipality: farm.municipality,
          })))
          pages = json.pagination?.pages || 1
          page += 1
        }
      } catch {
        // O mapa continua visível mesmo se a lista de produtores falhar.
      }
      if (!cancel) {
        setProducers(collected)
        setLoading(false)
      }
    }

    load()
    return () => { cancel = true }
  }, [province])

  const placeTooltip = (id: string) => {
    const shape = wrapperRef.current?.querySelector<SVGGraphicsElement>(`[data-municipality="${id}"]`)
    const tip = tooltipRef.current
    const wrapper = wrapperRef.current
    if (!shape || !tip || !wrapper) return

    const rect = shape.getBoundingClientRect()
    const boundary = wrapper.getBoundingClientRect()
    const gap = 12
    const margin = 8
    const tooltipWidth = tip.offsetWidth
    const tooltipHeight = tip.offsetHeight
    let left = rect.right + gap
    let top = rect.top + rect.height / 2 - tooltipHeight / 2

    if (left + tooltipWidth > boundary.right - margin) {
      left = rect.left - tooltipWidth - gap
    }
    left = clamp(left, boundary.left + margin, boundary.right - tooltipWidth - margin)
    top = clamp(top, boundary.top + margin, boundary.bottom - tooltipHeight - margin)

    setTooltip({
      id,
      left: left - boundary.left,
      top: top - boundary.top,
      ready: true,
    })
  }

  const showMunicipality = (id: string) => {
    setHoveredId(id)
    setTooltip((current) => current?.id === id ? current : { id, left: 0, top: 0, ready: false })
    requestAnimationFrame(() => placeTooltip(id))
  }

  const hideMunicipality = () => {
    setHoveredId(null)
    setTooltip(null)
  }

  const active = municipalities.find((item) => item.id === tooltip?.id)
  const activeProducers = active
    ? producers.filter((producer) => {
        const id = isLuanda
          ? municipalityIdFor(producer.municipality)
          : matchMunicipalityId(municipalities, producer.municipality)
        return id === active.id
      })
    : []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800"
        >
          <ArrowLeft size={16} className="mr-1" aria-hidden />
          {isEn ? 'Back to provinces' : 'Voltar às províncias'}
        </button>
        <p className="text-sm font-semibold text-gray-800">
          {isEn ? `Municipalities of ${province}` : `Municípios de ${province}`}
        </p>
      </div>

      <div ref={wrapperRef} className={`relative mx-auto w-full ${isLuanda ? 'max-w-[650px]' : 'max-w-5xl'}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label={isEn ? `Municipalities of ${province}` : `Municípios de ${province}`}
        >
          {municipalities.map((municipality) => {
            const isActive = hoveredId === municipality.id
            return (
              <path
                key={municipality.id}
                data-municipality={municipality.id}
                d={municipality.d}
                tabIndex={0}
                role="button"
                aria-label={municipality.label}
                fill={isActive ? HOVER_FILL : BASE_FILL}
                stroke="#ffffff"
                strokeWidth={4}
                strokeLinejoin="round"
                className="cursor-pointer outline-none transition-[fill] duration-200"
                onMouseEnter={() => showMunicipality(municipality.id)}
                onMouseLeave={hideMunicipality}
                onFocus={() => showMunicipality(municipality.id)}
                onBlur={hideMunicipality}
              />
            )
          })}

          {municipalities.map((municipality) => {
            const isActive = hoveredId === municipality.id
            const lines = isLuanda ? [municipality.label] : labelLines(municipality.label)
            const fontSize = isLuanda
              ? (municipality.label.length > 10 ? 22 : 26)
              : (lines.length > 1 ? 20 : municipality.label.length > 14 ? 18 : 24)
            const lineHeight = fontSize + 6
            const shared = {
              x: municipality.labelX,
              textAnchor: 'middle' as const,
              dominantBaseline: 'middle' as const,
              fontSize,
              fontWeight: 600,
              fontFamily: 'Arial, Helvetica, sans-serif',
              pointerEvents: 'none' as const,
            }
            return (
              <g key={`${municipality.id}-label`}>
                {lines.map((line, index) => {
                  const y = municipality.labelY + (index - (lines.length - 1) / 2) * lineHeight
                  return (
                    <g key={`${municipality.id}-${index}`}>
                      <text {...shared} y={y} fill="none" stroke={isActive ? HOVER_FILL : BASE_FILL} strokeWidth={5} strokeLinejoin="round">
                        {line}
                      </text>
                      <text {...shared} y={y} fill="#FFFFFF">
                        {line}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>

        <div
          ref={tooltipRef}
          className={`pointer-events-none absolute z-[80] min-w-[220px] max-w-[280px] rounded px-3.5 pb-2.5 pt-2 text-left text-[13px] leading-snug text-white shadow-lg ${tooltip ? 'block' : 'hidden'}`}
          style={{
            left: tooltip?.left ?? 0,
            top: tooltip?.top ?? 0,
            background: 'rgba(0, 0, 0, 0.88)',
            fontFamily: 'Arial, Helvetica, sans-serif',
            visibility: tooltip?.ready ? 'visible' : 'hidden',
          }}
          role="tooltip"
        >
          {active && (
            <>
              <div className="mb-1 text-center text-sm font-bold">{active.label}</div>
              {loading ? (
                <div className="text-center text-white/80">{isEn ? 'Loading producers...' : 'A carregar produtores...'}</div>
              ) : activeProducers.length > 0 ? (
                <ul className="space-y-1">
                  {activeProducers.slice(0, 8).map((producer, index) => (
                    <li key={`${producer.producerName}-${index}`}>
                      <span className="font-bold text-[#FFC107]">{producer.producerName}</span>
                      {producer.farmName ? <span className="text-white/90"> — {producer.farmName}</span> : null}
                    </li>
                  ))}
                  {activeProducers.length > 8 && (
                    <li className="text-white/70">
                      {isEn
                        ? `and ${activeProducers.length - 8} more`
                        : `e mais ${activeProducers.length - 8}`}
                    </li>
                  )}
                </ul>
              ) : (
                <div className="text-center text-white/80">
                  {isEn ? 'No producers registered in this municipality.' : 'Nenhum produtor cadastrado neste município.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
