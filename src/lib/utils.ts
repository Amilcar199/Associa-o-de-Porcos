/**
 * Utilitários gerais da aplicação
 */

/**
 * Formata uma data para o formato português de Angola
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('pt-AO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formata uma data para exibição relativa (ex: "há 2 horas")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h atrás`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d atrás`
  
  return formatDate(dateObj)
}

/**
 * Gera um slug a partir de um texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
}

/**
 * Trunca um texto para um determinado número de caracteres
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Formata um número para o formato de moeda de Angola (AOA)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(amount)
}

/**
 * Formata um número com separadores de milhares
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-AO').format(num)
}