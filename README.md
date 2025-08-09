# Associação de Porcos - Website Institucional

Website institucional completo para a Associação de Porcos, desenvolvido com Next.js 14, TypeScript, Tailwind CSS e MongoDB.

## 🚀 Tecnologias

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **Autenticação:** NextAuth.js
- **Email:** Nodemailer
- **Upload de Imagens:** MongoDB GridFS
- **Deploy:** Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB (local ou Atlas)
- Conta de email para envio (Gmail, Outlook, etc.)

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd associacao-de-porcos
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/associacao-porcos

# NextAuth.js
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@associacaoporcos.org.br
```

4. **Execute o script de setup:**
```bash
npm run setup
```

5. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── login/             # Página de login
│   ├── registro/          # Página de registro
│   ├── perfil/            # Perfil do usuário
│   ├── membros/           # Área de membros
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── admin/            # Componentes do admin
│   ├── layout/           # Header, Footer, etc.
│   ├── sections/         # Seções da homepage
│   └── ui/               # Componentes reutilizáveis
├── lib/                  # Utilitários
│   ├── mongodb.ts        # Conexão MongoDB
│   ├── auth.ts           # Configuração NextAuth
│   ├── email.ts          # Configuração Nodemailer
│   └── api-utils.ts      # Utilitários da API
├── models/               # Modelos Mongoose
└── types/                # Tipos TypeScript
```

## 🎯 Funcionalidades

### ✅ Fase 1 - Setup Inicial
- [x] Projeto Next.js 14 com TypeScript
- [x] Tailwind CSS configurado
- [x] Conexão MongoDB
- [x] Modelos de dados (User, Product, News, Collaborator, Contact)
- [x] Sistema de autenticação NextAuth.js
- [x] Layout responsivo com tema verde

### ✅ Fase 2 - CRUD e Admin Panel
- [x] API Routes completas (CRUD)
- [x] Painel administrativo
- [x] Sistema de upload de imagens (GridFS)
- [x] Middleware de autenticação
- [x] Gerenciamento de conteúdo

### ✅ Fase 3 - Funcionalidades Avançadas
- [x] Perfil de usuário completo
- [x] Área restrita para membros
- [x] Sistema de email (Nodemailer)
- [x] Otimização SEO (Meta tags, Sitemap, Robots.txt)
- [x] Páginas de login/registro
- [x] Recuperação de senha
- [x] Autenticação avançada

## 🔐 Autenticação

O sistema possui três níveis de acesso:

- **Admin:** Acesso completo ao painel administrativo
- **Member:** Acesso à área de membros e conteúdo exclusivo
- **Visitor:** Acesso público limitado

## 📧 Sistema de Email

Configurado com Nodemailer para:
- Emails de boas-vindas
- Notificações de contato
- Recuperação de senha
- Newsletter

## 🖼️ Upload de Imagens

Sistema de upload usando MongoDB GridFS:
- Suporte a múltiplos formatos
- Otimização automática
- Gerenciamento via painel admin

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run setup        # Setup inicial
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para `contato@associacaoporcos.org.br`

---

**Desenvolvido com ❤️ para a Associação de Porcos**
