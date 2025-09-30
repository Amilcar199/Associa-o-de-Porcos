# Associação de Porcos - Website Institucional

Website institucional completo para a Associação de Porcos, desenvolvido com Next.js 14, TypeScript, Tailwind CSS e Prisma + MySQL (migrado de MongoDB).

## 🚀 Tecnologias

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM, MySQL
- **Autenticação:** NextAuth.js
- **Email:** Nodemailer
- **Upload de Imagens:** (em migração) de MongoDB GridFS para armazenamento em disco + tabela `Image`
- **Deploy:** Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8+
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
# Database (MySQL)
DATABASE_URL="mysql://user:password@localhost:3306/associacao_porcos"

# NextAuth.js
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@associacaoporcos.ao
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
│   ├── prisma.ts         # Cliente Prisma (MySQL)
│   ├── auth.ts           # Configuração NextAuth
│   ├── email.ts          # Configuração Nodemailer
│   └── api-utils.ts      # Utilitários da API
├── models/               # (legado) Modelos Mongoose
prisma/
├── schema.prisma         # Esquema Prisma (MySQL)
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

Para suporte, envie um email para `contato@associacaoporcos.ao`

---

**Desenvolvido com ❤️ para a Associação de Porcos**

## 📘 Manual de Uso (Cliente)

Este manual explica de forma simples como navegar no site, tanto como visitante quanto como administrador.

### Para Visitantes (público em geral)

- **Cabeçalho e menu**: No topo você encontrará os links principais: Início, Quem Somos, Serviços, Produtos, Notícias e Contato. No canto direito aparecem as opções de Login e Registrar.
- **Troca de idioma**: Use o seletor de idioma no topo para alternar entre português e inglês.
- **Início**: Página com destaques e atalhos para as áreas principais.
- **Quem Somos / Sobre**: Informações sobre a associação. No submenu você encontra também a página de Colaboradores.
- **Serviços**: Lista de serviços oferecidos.
- **Produtos**: Lista de produtos. Clique em um item para ver detalhes (quando disponível).
- **Notícias**: Acompanhe as últimas novidades. Clique na notícia para ler a matéria completa.
- **Contato**: Formulário simples para enviar uma mensagem para a associação.
- **Cookies, Privacidade e Termos**: Links de políticas do site estão disponíveis no rodapé.

#### Autenticação e Área do Usuário

- **Registrar**: Crie sua conta fornecendo os dados solicitados.
- **Login**: Acesse com seu email e senha.
- **Esqueci a senha**: Use a opção de recuperação para redefinir a senha via email.
- **Perfil**: Após logado, acesse o menu do usuário no topo para entrar em Perfil, onde é possível ver/editar informações da conta.
- **Área de Membros**: Se sua conta for membro ou admin, o menu mostrará o link "Membros". Acesse para visualizar conteúdos exclusivos. Usuários não-membros podem solicitar associação (quando habilitado) e aguardar aprovação do admin.
- **Sair**: Use o menu do usuário > Sair para encerrar a sessão.

### Para Administradores (Painel Admin)

Após fazer login como administrador, um link para o painel aparece no topo (Admin). Clique para abrir o painel.

#### Estrutura do Painel

O menu lateral à esquerda contém as seções abaixo:

- **Dashboard**: Visão geral com indicadores, gráficos e atividades recentes.
- **Solicitações**: Aprovar ou rejeitar pedidos de associação de usuários.
- **Usuários**: Listar, criar e editar usuários; ajustar permissões (ex.: admin, member, visitor).
- **Produtos**:
  - Todos os Produtos: visualizar, pesquisar e editar.
  - Adicionar Produto: criar um novo produto.
  - Categorias: gerenciar categorias.
- **Conteúdo**:
  - Notícias: listar e editar notícias existentes.
  - Nova Notícia: publicar uma notícia rapidamente.
  - Colaboradores: gerenciar colaboradores exibidos no site público.
  - Conteúdo de Membros: gerenciar conteúdos exclusivos para a área de membros.
  - Novo Conteúdo: criar conteúdo exclusivo.
- **Contatos**: Mensagens recebidas pelo formulário de contato. Marque como lidas/resolvidas conforme necessário.
- **Mídia**: Gerenciar imagens do site (upload, listar e reutilizar).
- **Relatórios**: Estatísticas e relatórios de uso/conteúdo.
- **Configurações**: Ajustes gerais do site (ex.: logo e informações básicas quando disponíveis).

#### Fluxos Comuns no Admin (passo a passo)

- **Publicar uma notícia**:
  1) Ir em Conteúdo > Nova Notícia.
  2) Preencher título, conteúdo e imagem (opcional) e salvar.
  3) A notícia aparecerá em Notícias no site público.

- **Adicionar um produto**:
  1) Ir em Produtos > Adicionar Produto.
  2) Preencher dados, selecionar categoria e salvar.
  3) O produto aparecerá em Produtos no site público.

- **Aprovar solicitação de membro**:
  1) Ir em Solicitações.
  2) Analisar o pedido e clicar em Aprovar ou Rejeitar.
  3) O usuário aprovado passa a acessar a área de Membros.

- **Responder mensagens de contato**:
  1) Ir em Contatos.
  2) Abrir a mensagem, copiar o email do remetente e responder via sua caixa de email.
  3) Marcar como resolvida no painel (se aplicável).

- **Enviar e usar imagens**:
  1) Ir em Mídia e fazer upload da imagem.
  2) Ao criar conteúdo (ex.: notícia), selecione a imagem enviada.

#### Dicas Rápidas

- As notificações de sucesso/erro aparecem no topo da tela.
- Use a busca do painel para encontrar rapidamente registros.
- Para sair do painel, abra o menu do usuário no topo e clique em Sair.
