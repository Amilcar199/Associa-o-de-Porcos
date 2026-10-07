// Municípios de Luanda (Lei n.º 14/24 e codificação da Lei n.º 8/25).
// O desenho é um esquema da província: costa a oeste, Cacuaco a norte,
// Viana a leste, Belas e Mussulo a sul.

export interface LuandaMunicipality {
  id: string
  label: string
  d: string
  labelX: number
  labelY: number
}

export const LUANDA_MUNICIPALITIES_VIEWBOX = '0 0 820 1020'

export const LUANDA_MUNICIPALITIES: LuandaMunicipality[] = [
  { id: 'cacuaco', label: 'Cacuaco', d: 'M200,40 H780 V200 H200 Z', labelX: 490, labelY: 120 },
  { id: 'sambizanga', label: 'Sambizanga', d: 'M40,80 H200 V200 H40 Z', labelX: 120, labelY: 140 },
  { id: 'ingombota', label: 'Ingombota', d: 'M40,200 H200 V380 H40 Z', labelX: 120, labelY: 290 },
  { id: 'rangel', label: 'Rangel', d: 'M200,200 H380 V380 H200 Z', labelX: 290, labelY: 290 },
  { id: 'cazenga', label: 'Cazenga', d: 'M380,200 H560 V380 H380 Z', labelX: 470, labelY: 290 },
  { id: 'hoji-ya-henda', label: 'Hoji ya Henda', d: 'M560,200 H780 V380 H560 Z', labelX: 670, labelY: 290 },
  { id: 'maianga', label: 'Maianga', d: 'M40,380 H200 V560 H40 Z', labelX: 120, labelY: 470 },
  { id: 'samba', label: 'Samba', d: 'M200,380 H380 V560 H200 Z', labelX: 290, labelY: 470 },
  { id: 'kilamba-kiaxi', label: 'Kilamba Kiaxi', d: 'M380,380 H560 V560 H380 Z', labelX: 470, labelY: 470 },
  { id: 'viana', label: 'Viana', d: 'M560,380 H780 V760 H560 Z', labelX: 670, labelY: 570 },
  { id: 'talatona', label: 'Talatona', d: 'M40,560 H200 V760 H40 Z', labelX: 120, labelY: 660 },
  { id: 'camama', label: 'Camama', d: 'M200,560 H380 V760 H200 Z', labelX: 290, labelY: 660 },
  { id: 'mulenvos', label: 'Mulenvos', d: 'M380,560 H560 V760 H380 Z', labelX: 470, labelY: 660 },
  { id: 'mussulo', label: 'Mussulo', d: 'M20,760 H200 V980 H20 Z', labelX: 110, labelY: 870 },
  { id: 'belas', label: 'Belas', d: 'M200,760 H480 V980 H200 Z', labelX: 340, labelY: 870 },
  { id: 'kilamba', label: 'Kilamba', d: 'M480,760 H780 V980 H480 Z', labelX: 630, labelY: 870 },
]

export interface MapProducer {
  producerName: string
  farmName?: string
  municipality?: string
}

function normalizePlace(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const ALIASES: Record<string, string> = {
  'quilamba kiaxi': 'kilamba-kiaxi',
  'quilamba quiaxi': 'kilamba-kiaxi',
  'kilamba kiaxi': 'kilamba-kiaxi',
  'hoji ya henda': 'hoji-ya-henda',
  luanda: 'ingombota',
}

const BY_LABEL = new Map(
  LUANDA_MUNICIPALITIES.map((item) => [normalizePlace(item.label), item.id])
)

export function municipalityIdFor(name?: string): string | undefined {
  if (!name) return undefined
  const key = normalizePlace(name)
  return ALIASES[key] || BY_LABEL.get(key)
}

export function producersInMunicipality(producers: MapProducer[], municipalityId: string) {
  return producers.filter((producer) => municipalityIdFor(producer.municipality) === municipalityId)
}
