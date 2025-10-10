#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🐷 Configurando Associação de Porcos...\n')

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), 'env.example')

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📋 Criando arquivo .env.local...')
  fs.copyFileSync(envExamplePath, envPath)
  console.log('✅ Arquivo .env.local criado com sucesso!')
  console.log('⚠️  IMPORTANTE: Edite o arquivo .env.local com suas configurações reais.\n')
} else if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env.local já existe.\n')
} else {
  console.log('⚠️  Arquivo env.example não encontrado. Crie manualmente o .env.local.\n')
}

// Verificar estrutura de pastas públicas
const publicDirs = [
  'public/hero',
  'public/about',
  'public/products',
  'public/news',
  'public/collaborators',
  'public/partners'
]

console.log('📁 Criando estrutura de pastas públicas...')
publicDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`   ✅ ${dir}`)
  }
})

console.log('\n🎉 Setup concluído!')
console.log('\n📝 Próximos passos:')
console.log('1. Configure suas variáveis de ambiente no arquivo .env.local')
console.log('2. Execute: npm install')
console.log('3. Execute: npm run dev')
console.log('4. Acesse: http://assuino.com')
console.log('\n🚀 Bom desenvolvimento!')
