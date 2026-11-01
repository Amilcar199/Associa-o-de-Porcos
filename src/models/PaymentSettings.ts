import mongoose, { Schema, models, model } from 'mongoose'

const BankAccountSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  holder: { type: String, required: true, trim: true, maxlength: 80 },
  iban: { type: String, required: true, trim: true, maxlength: 34 },
  active: { type: Boolean, default: true },
})

const PayPayAccountSchema = new Schema({
  label: { type: String, required: true, trim: true, maxlength: 80 },
  account: { type: String, required: true, trim: true, maxlength: 40 },
  active: { type: Boolean, default: true },
})

const PaymentSettingsSchema = new Schema({
  key: { type: String, required: true, unique: true, default: 'default' },
  expressEnabled: { type: Boolean, default: true },
  banks: { type: [BankAccountSchema], default: [] },
  paypay: { type: [PayPayAccountSchema], default: [] },
}, {
  timestamps: true,
  collection: 'payment_settings',
})

export default models.PaymentSettings || model('PaymentSettings', PaymentSettingsSchema)
