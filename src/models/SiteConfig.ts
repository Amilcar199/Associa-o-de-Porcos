import mongoose, { Schema, model, models } from 'mongoose'

const SiteConfigSchema = new Schema({
  logoUrl: { type: String, default: '' },
  publicLogoUrl: { type: String, default: '' },
  adminLogoUrl: { type: String, default: '' },
  currency: { type: String, default: 'AOA' },
  locale: { type: String, default: 'pt-AO' },
  contactEmail: { type: String, default: 'Paulobaptista18@hotmail.com' },
  contactPhone: { type: String, default: '+244 923 221 950' },
  whatsappNumber: { type: String, default: '244923221950' },
  facebookUrl: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  tiktokUrl: { type: String, default: '' },
}, { timestamps: true, collection: 'site_config' })

export default models.SiteConfig || model('SiteConfig', SiteConfigSchema)