import { Document } from 'mongoose'

// Tipos de usuário
export interface User extends Document {
  _id: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'member' | 'visitor'
  avatar?: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  company?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipos de produto (porcos)
export interface Product extends Document {
  _id: string
  name: string
  description: string
  breed: string // raça
  age: number // idade em meses
  weight: number // peso em kg
  price?: number
  pricePerKg?: number
  saleForm?: 'carcaça' | 'vivo'
  images: string[]
  videos?: string[]
  features: string[] // características especiais
  healthStatus: 'excellent' | 'good' | 'fair'
  vaccinated: boolean
  location: string
  code: string
  availability: 'available' | 'sold' | 'reserved'
  seller: User | string
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipos de notícias
export interface News extends Document {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string
  images?: string[]
  videos?: string[]
  author: User | string
  category: 'news' | 'events' | 'tips' | 'market'
  tags: string[]
  published: boolean
  featured: boolean
  views: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Tipos de colaboradores
export interface Collaborator extends Document {
  _id: string
  name: string
  role: string
  company?: string
  description?: string
  avatar: string
  email?: string
  phone?: string
  website?: string
  socialMedia?: {
    linkedin?: string
    instagram?: string
    facebook?: string
  }
  isActive: boolean
  featured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// Tipos de contato
export interface Contact extends Document {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  createdAt: Date
  updatedAt: Date
}

// Tipos de configuração do site
export interface SiteConfig extends Document {
  _id: string
  siteName: string
  siteDescription: string
  logo: string
  favicon: string
  contactInfo: {
    email: string
    phone: string
    whatsapp: string
    address: string
  }
  socialMedia: {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage: string
  }
  updatedAt: Date
}

// Tipos para autenticação
export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'visitor'
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  company?: string
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Cotações oficiais de mercado (admin)
export interface MarketQuote extends Document {
  _id: string
  weekISO: string // ex: 2025-W37
  region: string
  saleForm: 'carcaça' | 'vivo'
  status: 'draft' | 'approved' | 'archived'
  refPricePerKg: number // preço de referência AOA/kg
  refPricePerHead?: number // opcional quando aplicável
  minSamples: number
  methodologyNote?: string
  createdBy: string
  approvedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Tipos para formulários
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface ProductFormData {
  name: string
  description: string
  breed: string
  age: number
  weight: number
  price?: number
  pricePerKg?: number
  saleForm?: 'carcaça' | 'vivo'
  features: string[]
  healthStatus: 'excellent' | 'good' | 'fair'
  vaccinated: boolean
  location: string
  tags: string[]
  images?: string[]
  videos?: string[]
}

export interface NewsFormData {
  title: string
  content: string
  excerpt: string
  category: 'news' | 'events' | 'tips' | 'market'
  tags: string[]
  published: boolean
  featured: boolean
  images?: string[]
  videos?: string[]
}

export interface CollaboratorFormData {
  name: string
  role: string
  company?: string
  description: string
  email?: string
  phone?: string
  website?: string
  featured: boolean
}

// Tipos para filtros e busca
export interface ProductFilters {
  breed?: string
  minAge?: number
  maxAge?: number
  minWeight?: number
  maxWeight?: number
  minPrice?: number
  maxPrice?: number
  location?: string
  availability?: 'available' | 'sold' | 'reserved'
  healthStatus?: 'excellent' | 'good' | 'fair'
  vaccinated?: boolean
}

export interface NewsFilters {
  category?: 'news' | 'events' | 'tips' | 'market'
  author?: string
  published?: boolean
  featured?: boolean
  dateFrom?: Date
  dateTo?: Date
}

// Tipos para dashboard/estatísticas
export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalNews: number
  totalContacts: number
  newContactsThisMonth: number
  activeProducts: number
  publishedNews: number
  recentActivity: Array<{
    type: 'user' | 'product' | 'news' | 'contact'
    action: string
    date: Date
    user?: string
  }>
}

// Tipos para conteúdo de membros
export interface MemberContent {
  _id: string
  title: string
  description: string
  type: 'document' | 'video' | 'article' | 'event'
  category: string
  url?: string
  thumbnail?: string
  content?: string
  fileUrl?: string
  videoUrl?: string
  eventDate?: Date
  eventLocation?: string
  isFeatured: boolean
  isActive: boolean
  author: { name: string; email: string }
  tags: string[]
  views: number
  downloads: number
  createdAt: Date
  updatedAt: Date
}
