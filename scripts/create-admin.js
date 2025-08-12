// scripts/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    console.log('🔍 Criando usuário administrador...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não está configurada');
      return;
    }

    console.log('🔌 Conectando...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado!');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Verificar se já existe admin
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('👑 Admin já existe:', existingAdmin.email);
      console.log('💡 Use as credenciais existentes');
    } else {
      console.log('👑 Criando admin...');
      
      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Criar usuário admin
      const adminUser = {
        name: 'Administrador',
        email: 'admin@associacao.ao',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        company: 'Associação de Porcos',
        bio: 'Usuário administrador padrão',
        location: 'Luanda, Angola',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(adminUser);
      
      if (result.acknowledged) {
        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Email: admin@associacao.ao');
        console.log('🔑 Senha: admin123');
        console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
      } else {
        console.log('❌ Erro ao criar admin');
      }
    }
    
    // Listar todos os usuários
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n👥 Usuários no banco:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Conexão fechada');
    }
    process.exit(0);
  }
}

createAdmin();
