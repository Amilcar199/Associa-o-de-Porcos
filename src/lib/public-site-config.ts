export interface PublicSiteConfig {
  logoUrl: string
  publicLogoUrl: string
  currency: string
  locale: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
  youtubeUrl: string
  twitterUrl: string
  tiktokUrl: string
}

export const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  logoUrl: '',
  publicLogoUrl: '',
  currency: 'AOA',
  locale: 'pt-AO',
  contactEmail: 'Paulobaptista18@hotmail.com',
  contactPhone: '+244 923 221 950',
  whatsappNumber: '244923221950',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
  tiktokUrl: '',
}

export function pickPublicSiteConfig(raw: Record<string, unknown> | null | undefined): PublicSiteConfig {
  if (!raw) return { ...DEFAULT_PUBLIC_SITE_CONFIG }
  return {
    logoUrl: String(raw.logoUrl || ''),
    publicLogoUrl: String(raw.publicLogoUrl || raw.logoUrl || ''),
    currency: String(raw.currency || 'AOA'),
    locale: String(raw.locale || 'pt-AO'),
    contactEmail: String(raw.contactEmail || DEFAULT_PUBLIC_SITE_CONFIG.contactEmail),
    contactPhone: String(raw.contactPhone || DEFAULT_PUBLIC_SITE_CONFIG.contactPhone),
    whatsappNumber: String(raw.whatsappNumber || DEFAULT_PUBLIC_SITE_CONFIG.whatsappNumber),
    facebookUrl: String(raw.facebookUrl || ''),
    instagramUrl: String(raw.instagramUrl || ''),
    linkedinUrl: String(raw.linkedinUrl || ''),
    youtubeUrl: String(raw.youtubeUrl || ''),
    twitterUrl: String(raw.twitterUrl || ''),
    tiktokUrl: String(raw.tiktokUrl || ''),
  }
}
