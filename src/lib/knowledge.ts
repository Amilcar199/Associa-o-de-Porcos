export const KNOWLEDGE_CATEGORIES = [
  { id: 'news', pt: 'Notícias', en: 'News' },
  { id: 'article', pt: 'Artigos', en: 'Articles' },
  { id: 'guide', pt: 'Guias técnicos', en: 'Technical guides' },
  { id: 'manual', pt: 'Manuais', en: 'Manuals' },
  { id: 'study', pt: 'Estudos', en: 'Studies' },
  { id: 'legislation', pt: 'Legislação', en: 'Legislation' },
  { id: 'tips', pt: 'Boas práticas', en: 'Good practices' },
  { id: 'nutrition', pt: 'Nutrição', en: 'Nutrition' },
  { id: 'health', pt: 'Sanidade', en: 'Herd health' },
  { id: 'reproduction', pt: 'Reprodução', en: 'Reproduction' },
  { id: 'biosecurity', pt: 'Biossegurança', en: 'Biosecurity' },
  { id: 'management', pt: 'Gestão', en: 'Management' },
  { id: 'training', pt: 'Formação', en: 'Training' },
  { id: 'events', pt: 'Eventos', en: 'Events' },
  { id: 'market', pt: 'Mercado', en: 'Market' },
] as const

export type KnowledgeCategoryId = (typeof KNOWLEDGE_CATEGORIES)[number]['id']

export function isKnowledgeCategory(value: string): value is KnowledgeCategoryId {
  return KNOWLEDGE_CATEGORIES.some((item) => item.id === value)
}

export function knowledgeLabel(id: string, isEn = false) {
  const found = KNOWLEDGE_CATEGORIES.find((item) => item.id === id)
  if (!found) return id
  return isEn ? found.en : found.pt
}

export function memberCategoryOptions(existing: string[], current?: string) {
  const labels = KNOWLEDGE_CATEGORIES.map((item) => item.pt)
  const merged = Array.from(new Set([...existing, ...labels]))
  if (current && !merged.includes(current)) merged.unshift(current)
  return merged
}
