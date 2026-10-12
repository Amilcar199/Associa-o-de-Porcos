'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { municipalityIdFor, PRODUCER_SCALES, producerScale, type MapProducer, type ProducerScale } from './luanda-municipalities'
import { matchMunicipalityId } from './province-municipalities'
import { MUNICIPALITY_MAPS } from './municipality-map-paths'

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
  const map = MUNICIPALITY_MAPS[province]
  const municipalities = map?.items || []
  const viewBox = map?.viewBox || '0 0 100 100'
  const [viewWidth = 100, viewHeight = 100] = viewBox.split(' ').slice(2).map(Number)
  const stroke = Math.max(viewWidth, viewHeight) / 150
  const clipId = `municipality-outline-${province.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [producers, setProducers] = useState<MapProducer[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedScale, setSelectedScale] = useState<ProducerScale | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    let cancel = false
    setSelectedId(null)
    setSelectedScale(null)

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
          collected.push(...batch.map((farm: MapProducer & { herd?: { total?: number } }) => ({
            producerName: farm.producerName,
            farmName: farm.farmName,
            municipality: farm.municipality,
            herdTotal: farm.herd?.total || 0,
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

  const selected = municipalities.find((item) => item.id === selectedId) || null
  const producersHere = (municipalityId: string) => producers.filter((producer) => {
    const id = isLuanda
      ? municipalityIdFor(producer.municipality)
      : matchMunicipalityId(municipalities, producer.municipality)
    return id === municipalityId
  })
  const selectedProducers = selected ? producersHere(selected.id) : []
  const visibleProducers = selectedScale
    ? selectedProducers.filter((producer) => producerScale(producer.herdTotal) === selectedScale)
    : []

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

      <div ref={wrapperRef} className="relative mx-auto w-full max-w-5xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={viewBox}
          className="mx-auto block h-auto max-h-[72vh] w-auto max-w-full overflow-visible"
          role="img"
          aria-label={isEn ? `Municipalities of ${province}` : `Municípios de ${province}`}
        >
          {map?.outline && (
            <defs>
              <clipPath id={clipId}>
                <path d={map.outline} />
              </clipPath>
            </defs>
          )}
          <g clipPath={map?.outline ? `url(#${clipId})` : undefined}>
            {municipalities.map((municipality) => {
              const isActive = hoveredId === municipality.id || selectedId === municipality.id
              return (
                <path
                  key={municipality.id}
                  data-municipality={municipality.id}
                  d={municipality.d}
                  tabIndex={0}
                  role="button"
                  aria-label={municipality.label}
                  aria-pressed={selectedId === municipality.id}
                  fill={isActive ? HOVER_FILL : BASE_FILL}
                  fillRule="evenodd"
                  stroke="#ffffff"
                  strokeWidth={stroke}
                  strokeLinejoin="round"
                  className="cursor-pointer outline-none transition-[fill] duration-200"
                  onClick={() => {
                    setSelectedId(municipality.id)
                    setSelectedScale(null)
                  }}
                  onMouseEnter={() => showMunicipality(municipality.id)}
                  onMouseLeave={hideMunicipality}
                  onFocus={() => showMunicipality(municipality.id)}
                  onBlur={hideMunicipality}
                />
              )
            })}
          </g>
          {map?.outline && (
            <path d={map.outline} fill="none" stroke="#ffffff" strokeWidth={stroke * 1.4} pointerEvents="none" />
          )}

          {municipalities.map((municipality) => {
            const isActive = hoveredId === municipality.id
            const lines = labelLines(municipality.label)
            const fontSize = municipality.labelSize * (lines.length > 1 ? 0.78 : 1)
            const lineHeight = fontSize * 1.15
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
                      <text {...shared} y={y} fill="none" stroke={isActive ? HOVER_FILL : BASE_FILL} strokeWidth={fontSize * 0.18} strokeLinejoin="round">
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

        {selected && (
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="font-heading text-lg font-semibold text-gray-900">{selected.label}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEn
                ? 'Choose the farm size. The list shows the producers registered in this municipality.'
                : 'Escolha o porte. A lista mostra os produtores cadastrados neste município.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRODUCER_SCALES.map((scale) => {
                const count = selectedProducers.filter((producer) => producerScale(producer.herdTotal) === scale.id).length
                const pressed = selectedScale === scale.id
                return (
                  <button
                    key={scale.id}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setSelectedScale(scale.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${pressed ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-200'}`}
                  >
                    {isEn ? scale.labelEn : scale.label}
                    <span className={pressed ? 'text-white/80' : 'text-gray-500'}> · {count} · {isEn ? scale.hintEn : scale.hint}</span>
                  </button>
                )
              })}
            </div>
            {selectedScale && (
              visibleProducers.length > 0 ? (
                <ul className="mt-4 divide-y divide-gray-100">
                  {visibleProducers.map((producer, index) => (
                    <li key={`${producer.producerName}-${producer.farmName}-${index}`} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                      <span>
                        <span className="font-semibold text-gray-900">{producer.producerName}</span>
                        {producer.farmName ? <span className="text-gray-600"> — {producer.farmName}</span> : null}
                      </span>
                      <span className="shrink-0 text-gray-500">{producer.herdTotal || 0} {isEn ? 'pigs' : 'suínos'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  {isEn ? `No producers of this size are registered in ${selected.label}.` : `Nenhum produtor deste porte está cadastrado em ${selected.label}.`}
                </p>
              )
            )}
          </div>
        )}

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
