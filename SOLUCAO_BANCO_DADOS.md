# 🔧 Solução para Problemas de Banco de Dados

## 🚨 **Problema Identificado**

- **Erro de login**: "Email ou senha incorretos"
- **Usuários não aparecem no banco**: Apenas no frontend
- **Causa**: Configuração incorreta do MongoDB

## 🎯 **Soluções Disponíveis**

### **Opção 1: MongoDB na Nuvem (Recomendado para Produção)**

#### **1.1 MongoDB Atlas (Gratuito)**
1. Acesse: https://cloud.mongodb.com/
2. Crie uma conta gratuita
3. Crie um novo cluster (gratuito)
4. Clique em "Connect" no seu cluster
5. Escolha "Connect your application"
6. Copie a string de conexão

#### **1.2 Atualizar .env.local**
```bash
# Substitua a linha MONGODB_URI no arquivo .env.local
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/associacao-porcos?retryWrites=true&w=majority
```

### **Opção 2: MongoDB Local (Para Desenvolvimento)**

#### **2.1 Instalar MongoDB no Ubuntu**
```bash
# Adicionar repositório oficial
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar serviço
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar status
sudo systemctl status mongod
```

#### **2.2 Verificar se está funcionando**
```bash
# Testar conexão
mongosh --eval "db.runCommand('ping')"
```

## 🧪 **Testar a Solução**

### **1. Testar Conexão**
```bash
node scripts/test-db-connection.js
```

### **2. Inicializar Banco de Dados**
```bash
node scripts/init-db.js
```

### **3. Credenciais de Teste**
Após executar o script de inicialização, você terá:
- **Email**: admin@associacao.ao
- **Senha**: admin123
- **Role**: admin

## 🔍 **Verificar se Funcionou**

### **1. Testar Login**
1. Acesse: http://assuino.com/login
2. Use as credenciais: admin@associacao.ao / admin123
3. Deve fazer login com sucesso

### **2. Verificar Dashboard Admin**
1. Acesse: http://assuino.com/admin/usuarios
2. Deve mostrar a lista de usuários
3. Deve permitir criar novos usuários

### **3. Verificar Banco de Dados**
1. Execute: `node scripts/test-db-connection.js`
2. Deve mostrar os usuários criados

## 🚀 **Próximos Passos**

### **1. Após Primeiro Login**
- ✅ Altere a senha do administrador
- ✅ Configure usuários reais
- ✅ Remova o usuário de teste se necessário

### **2. Para Produção**
- ✅ Use MongoDB Atlas ou outro serviço na nuvem
- ✅ Configure variáveis de ambiente seguras
- ✅ Use senhas fortes
- ✅ Configure backup automático

## 📞 **Suporte**

Se ainda houver problemas:

1. **Verifique os logs** do servidor
2. **Execute os scripts** de teste
3. **Verifique a conexão** com o banco
4. **Confirme as variáveis** de ambiente

## 🔐 **Variáveis de Ambiente Necessárias**

```bash
# Obrigatório
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/banco

# Obrigatório
NEXTAUTH_SECRET=chave-secreta-para-nextauth

# Obrigatório
NEXTAUTH_URL=http://assuino.com

# Opcional (para OAuth)
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

---

**⚠️ IMPORTANTE**: Nunca commite credenciais reais no Git. Use sempre variáveis de ambiente.