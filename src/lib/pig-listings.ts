import { ANGOLA_PROVINCE_NAMES } from '@/components/sections/PigMap/angola-provinces'

export const PIG_BREEDS = [
  'Landrace', 'Large White', 'Duroc', 'Hampshire', 'Pietrain', 'Yorkshire',
  'Chester White', 'Spotted', 'Tamworth', 'Gloucester Old Spots', 'Mangalitsa',
  'Ossabaw Island Hog', 'Mulefoot', 'Caipira', 'Piau', 'Moura', 'Canastra', 'Cruzado', 'Outro',
] as const

export function publicListingFilter(now = new Date()) {
  return {
    $and: [
      { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
      { availability: { $ne: 'sold' } },
      {
        $or: [
          { listingStatus: { $exists: false } },
          { listingStatus: null },
          {
            listingStatus: 'approved',
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: null },
              { expiresAt: { $gt: now } },
            ],
          },
        ],
      },
    ],
  }
}

function text(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function phone(value: unknown) {
  const raw = text(value, 20).replace(/[^\d+]/g, '')
  if (raw.length < 8) return ''
  return raw
}

function photos(value: unknown) {
  const list = Array.isArray(value) ? value : []
  return list
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item && item.length <= 300 && !item.includes('..') && (item.startsWith('/api/images/') || item.startsWith('http://') || item.startsWith('https://')))
    .slice(0, 6)
}

export function parsePigOffer(input: Record<string, any>): { data?: Record<string, unknown>; error?: string } {
  const name = text(input.name, 100)
  const breed = text(input.breed, 40)
  const description = text(input.description, 1000)
  const location = text(input.location, 100)
  if (!name) return { error: 'O nome do anúncio é obrigatório' }
  if (!PIG_BREEDS.includes(breed as typeof PIG_BREEDS[number])) return { error: 'Escolha uma raça de suíno' }
  if (description.length < 10) return { error: 'Descreva o lote de suínos' }
  if (!location) return { error: 'A localização é obrigatória' }

  const age = Number(input.age)
  const weight = Number(input.weight)
  const quantity = Number(input.quantity ?? 1)
  if (!Number.isFinite(age) || age < 0 || age > 120) return { error: 'Idade inválida' }
  if (!Number.isFinite(weight) || weight < 1 || weight > 500) return { error: 'Peso inválido' }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5000) return { error: 'Quantidade inválida' }

  const price = input.price === '' || input.price == null ? undefined : Number(input.price)
  const pricePerKg = input.pricePerKg === '' || input.pricePerKg == null ? undefined : Number(input.pricePerKg)
  const hasPrice = typeof price === 'number' && price > 0
  const hasPricePerKg = typeof pricePerKg === 'number' && pricePerKg > 0
  if ((price != null && !hasPrice) || (pricePerKg != null && !hasPricePerKg)) return { error: 'Preço inválido' }
  if (!hasPrice && !hasPricePerKg) return { error: 'Informe o preço por cabeça ou por kg' }

  const saleForm = input.saleForm === 'carcaça' || input.saleForm === 'vivo' ? input.saleForm : 'vivo'
  const healthStatus = ['excellent', 'good', 'fair'].includes(input.healthStatus) ? input.healthStatus : 'good'
  const contactPhone = phone(input.contactPhone)
  const whatsapp = phone(input.whatsapp)
  if (!contactPhone && !whatsapp) return { error: 'Informe telefone ou WhatsApp para o interessado falar consigo' }

  const images = photos(input.images)
  if (!images.length) return { error: 'Adicione pelo menos uma foto do suíno' }

  return {
    data: {
      name,
      description,
      breed,
      age: Math.round(age),
      weight,
      quantity,
      price: hasPrice ? price : undefined,
      pricePerKg: hasPricePerKg ? pricePerKg : undefined,
      saleForm,
      healthStatus,
      vaccinated: Boolean(input.vaccinated),
      location: ANGOLA_PROVINCE_NAMES.includes(location) ? location : location,
      contactPhone: contactPhone || undefined,
      whatsapp: whatsapp || undefined,
      images,
      features: [],
      tags: ['suíno'],
    },
  }
}
