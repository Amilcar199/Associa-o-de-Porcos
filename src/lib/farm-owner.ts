import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

export interface OwnerHerd {
  total: number
  females: number
  forSlaughter: number
  forBreeding: number
}

export interface OwnerProduction {
  sows: number
  boars: number
  fattening: number
}

function count(value: unknown, max = 1_000_000): number | null {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > max) return null
  return Math.round(number)
}

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export function cleanFarmPhotos(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || item.length > 300 || item.includes('..')) return false
      return item.startsWith('/api/images/') || item.startsWith('http://') || item.startsWith('https://')
    })
    .slice(0, 6)
}

export function parseOwnerFarm(input: Record<string, any>): { data?: Record<string, unknown>; error?: string } {
  const producerName = text(input.producerName, 120)
  const province = text(input.province, 80)
  if (!producerName) return { error: 'Nome do produtor é obrigatório' }
  if (!province || !ANGOLA_PROVINCE_NAMES.includes(province)) return { error: 'Selecione uma província válida de Angola' }

  const herdInput = input.herd && typeof input.herd === 'object' ? input.herd : {}
  const total = count(herdInput.total)
  const females = count(herdInput.females ?? 0)
  const forSlaughter = count(herdInput.forSlaughter ?? 0)
  const forBreeding = count(herdInput.forBreeding ?? 0)
  if (total == null || females == null || forSlaughter == null || forBreeding == null) {
    return { error: 'Informe quantidades válidas do rebanho' }
  }
  if (females > total || forSlaughter > total || forBreeding > total) {
    return { error: 'Nenhuma parte do rebanho pode ser maior que o total' }
  }

  const productionInput = input.production && typeof input.production === 'object' ? input.production : {}
  const sows = count(productionInput.sows ?? 0)
  const boars = count(productionInput.boars ?? 0)
  const fattening = count(productionInput.fattening ?? 0)
  if (sows == null || boars == null || fattening == null) {
    return { error: 'Informe matrizes, reprodutores e animais de engorda com valores válidos' }
  }

  const capacityValue = input.capacity === '' || input.capacity == null ? undefined : count(input.capacity)
  if (input.capacity !== '' && input.capacity != null && capacityValue == null) {
    return { error: 'Capacidade inválida' }
  }

  const email = text(input.email, 120)
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: 'Email inválido' }

  return {
    data: {
      producerName,
      farmName: text(input.farmName, 120) || undefined,
      province,
      municipality: text(input.municipality, 120) || undefined,
      phone: text(input.phone, 30) || undefined,
      email: email || undefined,
      herd: { total, females, forSlaughter, forBreeding },
      notes: text(input.notes, 500) || undefined,
      capacity: capacityValue,
      description: text(input.description, 1000) || undefined,
      photos: cleanFarmPhotos(input.photos),
      production: { sows, boars, fattening },
    },
  }
}
