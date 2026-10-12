import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

export const PRODUCER_REGIONS = [
  {
    id: 'norte',
    label: 'Norte',
    provinces: ['Bengo', 'Cabinda', 'Cuanza Norte', 'Ícolo e Bengo', 'Luanda', 'Malanje', 'Uíge', 'Zaire'],
  },
  {
    id: 'centro',
    label: 'Centro',
    provinces: ['Benguela', 'Bié', 'Cuanza Sul', 'Huambo'],
  },
  {
    id: 'leste',
    label: 'Leste',
    provinces: ['Lunda Norte', 'Lunda Sul', 'Moxico', 'Moxico Oriental'],
  },
  {
    id: 'sul',
    label: 'Sul',
    provinces: ['Cuando', 'Cubango', 'Cunene', 'Huíla', 'Namibe'],
  },
] as const

export const PRODUCER_CATEGORIES = [
  { id: 'sows', field: 'production.sows', label: 'Matrizes', labelEn: 'Sows' },
  { id: 'boars', field: 'production.boars', label: 'Reprodutores', labelEn: 'Boars' },
  { id: 'fattening', field: 'production.fattening', label: 'Engorda', labelEn: 'Fattening' },
  { id: 'slaughter', field: 'herd.forSlaughter', label: 'Para abate', labelEn: 'For slaughter' },
  { id: 'breeding', field: 'herd.forBreeding', label: 'Reprodução', labelEn: 'Breeding' },
] as const

export const PRODUCER_HERD_MINIMUMS = [50, 100, 500, 1000] as const

export type ProducerCategoryId = (typeof PRODUCER_CATEGORIES)[number]['id']

const CATEGORY_FIELDS = new Map(PRODUCER_CATEGORIES.map((category) => [category.id, category.field]))

export function provincesForRegion(regionId: string) {
  return PRODUCER_REGIONS.find((region) => region.id === regionId)?.provinces
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function buildApprovedFarmQuery(input: {
  q?: string
  region?: string
  province?: string
  municipality?: string
  categories?: string[]
  minHerd?: number
}) {
  const query: Record<string, unknown> = { status: 'approved', isActive: true }
  const regionProvinces = input.region ? provincesForRegion(input.region) : undefined
  const province = input.province?.trim() || ''

  if (province) {
    const known = (ANGOLA_PROVINCE_NAMES as string[]).includes(province)
    const insideRegion = !regionProvinces || (regionProvinces as readonly string[]).includes(province)
    query.province = known && insideRegion ? province : { $in: [] }
  } else if (regionProvinces) {
    query.province = { $in: [...regionProvinces] }
  }

  const municipality = input.municipality?.trim().slice(0, 80) || ''
  if (municipality) {
    query.municipality = new RegExp(`^${escapeRegex(municipality)}$`, 'i')
  }

  const minHerd = Number(input.minHerd)
  if (Number.isFinite(minHerd) && minHerd > 0) {
    query['herd.total'] = { $gte: Math.min(minHerd, 1_000_000) }
  }

  const clauses: Record<string, unknown>[] = []
  const q = input.q?.trim().slice(0, 80) || ''
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i')
    clauses.push({
      $or: [
        { producerName: pattern },
        { farmName: pattern },
        { municipality: pattern },
        { province: pattern },
      ],
    })
  }

  const categoryOr = (input.categories || [])
    .map((category) => CATEGORY_FIELDS.get(category as ProducerCategoryId))
    .filter((field): field is string => Boolean(field))
    .map((field) => ({ [field]: { $gt: 0 } }))
  if (categoryOr.length) clauses.push({ $or: categoryOr })
  if (clauses.length) query.$and = clauses

  return query
}

export function farmListSort(sort?: string | null): { sort: string; order: 'asc' | 'desc' } {
  if (sort === 'name') return { sort: 'producerName', order: 'asc' }
  if (sort === 'herd') return { sort: 'herd.total', order: 'desc' }
  if (sort === 'capacity') return { sort: 'capacity', order: 'desc' }
  return { sort: 'createdAt', order: 'desc' }
}
