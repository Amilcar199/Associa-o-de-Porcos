const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Importar o modelo User
const User = require('../src/models/User');

async function initializeDatabase() {
  try {
    console.log('🔍 Inicializando banco de dados...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não está configurada');
      console.log('💡 Configure a variável MONGODB_URI no arquivo .env.local');
      return;
    }

    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe um usuário admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('👑 Usuário administrador já existe:', existingAdmin.email);
      console.log('💡 Use as credenciais existentes para fazer login');
    } else {
      console.log('👑 Criando usuário administrador padrão...');
      
      // Criar hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Criar usuário admin
      const adminUser = new User({
        name: 'Administrador',
        email: 'admin@associacao.ao',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        company: 'Associação de Porcos',
        bio: 'Usuário administrador padrão do sistema',
        location: 'Luanda, Angola',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          newsletter: true
        }
      });

      await adminUser.save();
      console.log('✅ Usuário administrador criado com sucesso!');
      console.log('📧 Email: admin@associacao.ao');
      console.log('🔑 Senha: admin123');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    }

    // Listar todos os usuários
    const allUsers = await User.find().select('name email role isActive createdAt');
    console.log('\n👥 Usuários no banco de dados:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUÇÕES:');
      console.log('1. Para MongoDB local:');
      console.log('   - Instale o MongoDB: https://docs.mongodb.com/manual/installation/');
      console.log('   - Inicie o serviço: sudo systemctl start mongod');
      console.log('   - Verifique se está rodando: sudo systemctl status mongod');
      console.log('\n2. Para MongoDB na nuvem (MongoDB Atlas):');
      console.log('   - Crie uma conta em: https://cloud.mongodb.com/');
      console.log('   - Crie um cluster gratuito');
      console.log('   - Obtenha a string de conexão');
      console.log('   - Atualize MONGODB_URI no .env.local');
    } else if (error.message.includes('Cannot find module')) {
      console.log('\n💡 SOLUÇÃO:');
      console.log('   - Execute o script do diretório raiz do projeto');
      console.log('   - Verifique se o caminho ../src/models/User está correto');
    }
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Conexão fechada');
    }
    process.exit(0);
  }
}

initializeDatabase();