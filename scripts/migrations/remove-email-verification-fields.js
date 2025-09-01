// scripts/migrations/remove-email-verification-fields.js
// Remove campos/flags de verificação de email de todos os usuários

import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config({ path: process.env.DOTENV_PATH || '.env.local' })

async function run() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    console.error('❌ MONGODB_URI não configurada. Defina no .env.local ou exporte a variável.')
    process.exit(1)
  }

  await mongoose.connect(mongoUri)
  const db = mongoose.connection.db
  const users = db.collection('users')

  console.log('🔧 Removendo campos de verificação de email dos usuários...')
  const res = await users.updateMany(
    {},
    {
      $unset: {
        emailVerified: "",
        emailVerificationCode: "",
        emailVerificationExpires: "",
        emailVerificationToken: ""
      }
    }
  )

  console.log(`✅ Campos removidos de ${res.modifiedCount} usuário(s).`)
  await mongoose.disconnect()
}

run().catch(async (err) => {
  console.error('Erro na migração:', err)
  try { await mongoose.disconnect() } catch {}
  process.exit(1)
})

