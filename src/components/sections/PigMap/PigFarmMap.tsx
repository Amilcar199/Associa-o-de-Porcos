'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { ANGOLA_CENTER, ANGOLA_DEFAULT_ZOOM, getProvinceGeo } from './angola-provinces'
import type { ProvinceStats } from '@/types'

interface PigFarmMapProps {
  provinces: ProvinceStats[]
  isEn?: boolean
  onRegisterClick?: (province: string) => void
}

// Cor e raio do marcador proporcionais à quantidade de porcos da província
function getMarkerStyle(totalPigs: number, maxPigs: number) {
  const hasData = totalPigs > 0
  const ratio = maxPigs > 0 ? totalPigs / maxPigs : 0
  const radius = hasData ? 10 + ratio * 22 : 7
  const color = hasData ? '#15803d' : '#9ca3af' // verde (primary-700) vs cinza para sem dados
  const fillOpacity = hasData ? 0.55 : 0.25
  return { radius, color, fillOpacity }
}

export default function PigFarmMap({ provinces, isEn = false, onRegisterClick }: PigFarmMapProps) {
  const maxPigs = Math.max(1, ...provinces.map((p) => p.totalPigs))

  return (
    <MapContainer
      center={ANGOLA_CENTER}
      zoom={ANGOLA_DEFAULT_ZOOM}
      minZoom={4.5}
      maxZoom={9}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {provinces.map((stat) => {
        const geo = getProvinceGeo(stat.province)
        if (!geo) return null
        const { radius, color, fillOpacity } = getMarkerStyle(stat.totalPigs, maxPigs)

        return (
          <CircleMarker
            key={stat.province}
            center={[geo.lat, geo.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
              {stat.province}
            </Tooltip>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-gray-900 mb-2">{stat.province}</p>
                {stat.farmersCount > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      <strong>{stat.farmersCount}</strong> {isEn ? 'registered producer(s)' : 'produtor(es) cadastrado(s)'}
                    </li>
                    <li>
                      <strong>{stat.totalPigs}</strong> {isEn ? 'total pigs' : 'porcos no total'}
                    </li>
                    <li>{isEn ? 'Females' : 'Fêmeas'}: <strong>{stat.females}</strong></li>
                    <li>{isEn ? 'For slaughter' : 'P/ abate'}: <strong>{stat.forSlaughter}</strong></li>
                    <li>{isEn ? 'For breeding' : 'P/ reprodução'}: <strong>{stat.forBreeding}</strong></li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isEn ? 'No producers registered yet in this province.' : 'Nenhum produtor cadastrado nesta província ainda.'}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onRegisterClick?.(stat.province)}
                  className="mt-3 w-full text-center text-sm font-medium text-primary-700 hover:text-primary-800 underline"
                >
                  {isEn ? 'Register a farm here' : 'Cadastrar fazenda nesta província'}
                </button>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
