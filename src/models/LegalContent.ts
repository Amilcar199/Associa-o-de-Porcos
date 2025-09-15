import { Schema, model, models } from 'mongoose'

export interface LegalItem {
  url: string
  title?: string
  description?: string
}

const LegalItemSchema = new Schema<LegalItem>({
  url: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false })

const LegalSectionSchema = new Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'constitution', 'admin-body'
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  items: { type: [LegalItemSchema], default: [] },
  updatedBy: { type: String, default: '' }
}, { timestamps: true, collection: 'legal_sections' })

const LegalSection = models.LegalSection || model('LegalSection', LegalSectionSchema)

export default LegalSection

