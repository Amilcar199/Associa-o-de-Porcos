'use client'

import { useId, useLayoutEffect, useRef, useState } from 'react'
import { ANGOLA_MAP_PATHS, ANGOLA_MAP_VIEWBOX } from './angola-map-paths'
import { ANGOLA_PROVINCE_META, PROVINCE_LABEL_OFFSET, getProvinceMeta } from './angola-map-meta'
import type { ProvinceStats } from '@/types'

const BASE_FILL = '#ffa500'
const HOVER_FILL = '#D7181E'
const LABEL_FILL = '#FFFFFF'

interface LabelPoint {
  x: number
  y: number
}

interface TooltipState {
  id: string
  left: number
  top: number
  placement: 'right' | 'left' | 'top' | 'bottom'
  ready: boolean
}

interface AngolaSvgMapProps {
  provinces?: ProvinceStats[]
  isEn?: boolean
  selectedId?: string | null
  onProvinceClick?: (dataName: string, id: string) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export default function AngolaSvgMap({
  provinces = [],
  isEn = false,
  selectedId = null,
  onProvinceClick,
}: AngolaSvgMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const uid = useId().replace(/:/g, '')
  const [labels, setLabels] = useState<Record<string, LabelPoint>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const statsByName = new Map(provinces.map((item) => [item.province, item]))

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const next: Record<string, LabelPoint> = {}
    for (const province of ANGOLA_PROVINCE_META) {
      const shape = svg.querySelector<SVGGraphicsElement>(`#${uid}-${province.id}`)
      if (!shape) continue
      const box = shape.getBBox()
      const offset = PROVINCE_LABEL_OFFSET[province.id]
      next[province.id] = {
        x: box.x + box.width / 2 + (offset?.x ?? 0),
        y: box.y + box.height / 2 + (offset?.y ?? 0),
      }
    }
    setLabels(next)
  }, [uid])

  const placeTooltip = (id: string) => {
    const shape = svgRef.current?.querySelector<SVGGraphicsElement>(`#${uid}-${id}`)
    const tip = tooltipRef.current
    const wrapper = wrapperRef.current
    if (!shape || !tip || !wrapper) return

    const rect = shape.getBoundingClientRect()
    const boundary = wrapper.getBoundingClientRect()
    const gap = 14
    const margin = 8
    const tooltipWidth = tip.offsetWidth
    const tooltipHeight = tip.offsetHeight
    const anchorX = rect.left + rect.width / 2
    const anchorY = rect.top + rect.height / 2

    const canRight = rect.right + gap + tooltipWidth <= boundary.right - margin
    const canLeft = rect.left - gap - tooltipWidth >= boundary.left + margin
    const canBottom = rect.bottom + gap + tooltipHeight <= boundary.bottom - margin
    const canTop = rect.top - gap - tooltipHeight >= boundary.top + margin

    let placement: TooltipState['placement'] = 'right'
    let left = rect.right + gap
    let top = anchorY - tooltipHeight / 2

    if (canRight) {
      placement = 'right'
      left = rect.right + gap
      top = anchorY - tooltipHeight / 2
    } else if (canLeft) {
      placement = 'left'
      left = rect.left - tooltipWidth - gap
      top = anchorY - tooltipHeight / 2
    } else if (canBottom) {
      placement = 'bottom'
      left = anchorX - tooltipWidth / 2
      top = rect.bottom + gap
    } else if (canTop) {
      placement = 'top'
      left = anchorX - tooltipWidth / 2
      top = rect.top - tooltipHeight - gap
    }

    left = clamp(left, boundary.left + margin, boundary.right - tooltipWidth - margin)
    top = clamp(top, boundary.top + margin, boundary.bottom - tooltipHeight - margin)
    setTooltip({
      id,
      left: left - boundary.left,
      top: top - boundary.top,
      placement,
      ready: true,
    })
  }

  const showProvince = (id: string) => {
    setHoveredId(id)
    setTooltip((current) => current?.id === id ? current : { id, left: 0, top: 0, placement: 'right', ready: false })
    requestAnimationFrame(() => placeTooltip(id))
  }

  const hideProvince = () => {
    setHoveredId(null)
    setTooltip(null)
  }

  const activeTip = tooltip ? getProvinceMeta(tooltip.id) : undefined
  const activeStats = activeTip ? statsByName.get(activeTip.dataName) : undefined
  const highlighted = hoveredId || selectedId

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-[650px]">
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={ANGOLA_MAP_VIEWBOX}
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={isEn ? 'Map of Angola by province' : 'Mapa de Angola por província'}
      >
        {ANGOLA_MAP_PATHS.map((shape) => {
          const meta = getProvinceMeta(shape.id)
          const isActive = highlighted === shape.id
          const fill = isActive ? HOVER_FILL : BASE_FILL
          return (
            <path
              key={shape.id}
              id={`${uid}-${shape.id}`}
              d={shape.d}
              tabIndex={0}
              role="button"
              aria-label={meta?.label || shape.id}
              fill={fill}
              stroke="#ffffff"
              strokeWidth={48}
              strokeLinejoin="round"
              className="cursor-pointer outline-none transition-[fill] duration-200"
              onMouseEnter={() => showProvince(shape.id)}
              onMouseLeave={hideProvince}
              onFocus={() => showProvince(shape.id)}
              onBlur={hideProvince}
              onClick={() => meta && onProvinceClick?.(meta.dataName, shape.id)}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && meta) {
                  event.preventDefault()
                  onProvinceClick?.(meta.dataName, shape.id)
                }
              }}
            />
          )
        })}

        {ANGOLA_PROVINCE_META.map((province) => {
          const point = labels[province.id]
          if (!point) return null
          const isActive = highlighted === province.id
          const outline = isActive ? HOVER_FILL : BASE_FILL
          const shared = {
            x: point.x,
            y: point.y,
            textAnchor: 'middle' as const,
            dominantBaseline: 'middle' as const,
            fontSize: 500,
            fontWeight: 600,
            fontFamily: 'Arial, Helvetica, sans-serif',
            pointerEvents: 'none' as const,
          }
          return (
            <g key={province.id}>
              <text {...shared} fill="none" stroke={outline} strokeWidth={100} strokeLinejoin="round">
                {province.label}
              </text>
              <text {...shared} fill={LABEL_FILL}>
                {province.label}
              </text>
            </g>
          )
        })}
      </svg>

      <div
        ref={tooltipRef}
        className={`pointer-events-none absolute z-[80] min-w-[200px] max-w-[240px] rounded px-3.5 pb-2.5 pt-2 text-center text-[13px] leading-snug text-white shadow-lg ${tooltip ? 'block' : 'hidden'}`}
        style={{
          left: tooltip?.left ?? 0,
          top: tooltip?.top ?? 0,
          background: 'rgba(0, 0, 0, 0.88)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          visibility: tooltip?.ready ? 'visible' : 'hidden',
        }}
        role="tooltip"
      >
        {activeTip && (
          <>
            <div className="mb-1 text-sm font-bold">{activeTip.label}</div>
            {activeStats && activeStats.farmersCount > 0 ? (
              <div className="space-y-0.5">
                <div><b>{isEn ? 'Producers:' : 'Produtores:'}</b> <span className="font-bold text-[#FFC107]">{activeStats.farmersCount}</span></div>
                <div><b>{isEn ? 'Pigs:' : 'Porcos:'}</b> <span className="font-bold text-[#FFC107]">{activeStats.totalPigs}</span></div>
                <div><b>{isEn ? 'Females:' : 'Fêmeas:'}</b> <span className="font-bold text-[#FFC107]">{activeStats.females}</span></div>
                <div><b>{isEn ? 'For slaughter:' : 'P/ abate:'}</b> <span className="font-bold text-[#FFC107]">{activeStats.forSlaughter}</span></div>
                <div><b>{isEn ? 'For breeding:' : 'P/ reprodução:'}</b> <span className="font-bold text-[#FFC107]">{activeStats.forBreeding}</span></div>
              </div>
            ) : (
              <div className="text-white/80">
                {isEn ? 'No producers registered in this province yet.' : 'Nenhum produtor cadastrado nesta província ainda.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
