import mongoose, { Schema, model, models } from 'mongoose'

const SiteConfigSchema = new Schema({
  logoUrl: { type: String, default: '' },
  publicLogoUrl: { type: String, default: '' },
  adminLogoUrl: { type: String, default: '' },
  currency: { type: String, default: 'AOA' },
  locale: { type: String, default: 'pt-AO' },
  contactEmail: { type: String, default: '' },
}, { timestamps: true, collection: 'site_config' })

export default models.SiteConfig || model('SiteConfig', SiteConfigSchema)