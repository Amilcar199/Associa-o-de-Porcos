const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function simpleTest() {
  try {
    console.log('🔍 Teste Simples de Conexão MongoDB...');
    console.log('📡 MONGODB_URI configurada:', !!process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não está configurada');
      return;
    }

    console.log('🔌 Conectando...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Conexão estabelecida!');
    
    // Listar coleções
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Coleções:', collections.map(c => c.name));
    
    // Contar documentos em cada coleção
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documentos`);
      } catch (err) {
        console.log(`  - ${collection.name}: erro ao contar`);
      }
    }
    
    // Verificar se há usuários
    const usersCollection = db.collection('users');
    if (usersCollection) {
      const userCount = await usersCollection.countDocuments();
      console.log(`\n👥 Total de usuários: ${userCount}`);
      
      if (userCount > 0) {
        const users = await usersCollection.find({}).limit(3).toArray();
        console.log('👤 Primeiros usuários:');
        users.forEach(user => {
          console.log(`  - ${user.name || 'Sem nome'} (${user.email}) - ${user.role || 'Sem role'}`);
        });
      }
    }
    
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

simpleTest();