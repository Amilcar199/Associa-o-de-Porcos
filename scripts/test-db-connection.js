const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com MongoDB...');
    console.log('📡 URI:', process.env.MONGODB_URI ? 'Configurada' : 'NÃO CONFIGURADA');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não está configurada no .env.local');
      console.log('💡 Configure a variável MONGODB_URI no arquivo .env.local');
      return;
    }

    console.log('🔌 Tentando conectar...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Conexão com MongoDB estabelecida com sucesso!');
    
    // Testar operações básicas
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Coleções encontradas:', collections.map(c => c.name));
    
    // Testar modelo User
    const User = require('../src/models/User');
    const userCount = await User.countDocuments();
    console.log('👥 Total de usuários no banco:', userCount);
    
    // Listar alguns usuários
    const users = await User.find().select('name email role isActive').limit(5);
    console.log('👤 Usuários encontrados:', users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive
    })));
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Dica: Verifique se o MongoDB está rodando localmente');
      console.log('💡 Para MongoDB local: sudo systemctl start mongod');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Dica: Verifique usuário e senha do MongoDB');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Dica: Verifique se a URL do cluster está correta');
    }
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Conexão fechada');
    }
    process.exit(0);
  }
}

testConnection();