// scripts/create-admin.js (CommonJS)
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1) Carrega .env.local OU .env (o que existir primeiro)
const root = process.cwd();
const candidates = [path.join(root, '.env.local'), path.join(root, '.env')];
let loaded = false;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loaded = true;
    console.log(`🌱 Carregado: ${path.basename(p)}`);
    break;
  }
}
if (!loaded) {
  dotenv.config(); // tenta padrão
  console.log('🌱 Tentativa de carregar .env padrão');
}

// (Opcional) mostrar CWD só pra depurar
console.log('📂 CWD:', root);

// 2) Sobe tudo
async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI não encontrado. Confira se está em .env ou .env.local na raiz do projeto.');
    process.exit(1);
  }

  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@site.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@010292546';

  await mongoose.connect(mongoUri);

  const userSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['visitor', 'member', 'admin'], default: 'admin' },
      isActive: { type: Boolean, default: true },
      preferences: {
        newsletter: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
      },
    },
    { timestamps: true, collection: 'users' }
  );

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    if (String(process.env.SEED_OVERWRITE).toLowerCase() === 'true') {
      console.log('♻️ Atualizando usuário existente:', email);
      const hashedOverwrite = await bcrypt.hash(password, 12);
      exists.name = name;
      exists.password = hashedOverwrite;
      exists.role = 'admin';
      exists.isActive = true;
      await exists.save();
      console.log('✅ Senha e dados atualizados com sucesso.');
      await mongoose.connection.close();
      return;
    }
    console.log('⚠️ Já existe usuário com esse email:', email, '\n   → Dica: use SEED_OVERWRITE=true para atualizar a senha.');
    await mongoose.connection.close();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email: String(email).toLowerCase(),
    password: hashed,
    role: 'admin',
    isActive: true,
    preferences: { newsletter: false, notifications: true },
  });

  console.log('✅ Admin criado com sucesso:', email);
  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error('Erro ao criar admin:', err);
  await mongoose.connection.close();
  process.exit(1);
});
 