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
NEXTAUTH_URL=http://assuino.com

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
│   │   ├── produtos/      # CRUD de produtos (porcos à venda)
│   │   ├── noticias/      # CRUD de notícias
│   │   ├── colaboradores/ # Gestão de colaboradores
│   │   ├── usuarios/      # Gestão de usuários e permissões
│   │   ├── solicitacoes/  # Aprovação de pedidos de associação
│   │   ├── suinocultura/  # Aprovação de cadastros do Mapa Interativo (novo)
│   │   ├── contatos/      # Mensagens do formulário de contacto
│   │   ├── configuracoes/ # Configurações gerais do site
│   │   └── relatorios/    # Estatísticas e relatórios
│   ├── api/               # API Routes (REST, JSON)
│   │   ├── products/      # Produtos (porcos à venda)
│   │   ├── news/          # Notícias
│   │   ├── collaborators/ # Colaboradores
│   │   ├── contact/       # Formulário de contacto (público)
│   │   ├── farms/         # Cadastro/estatísticas do Mapa Interativo (novo, público)
│   │   ├── admin/         # Endpoints restritos a administradores
│   │   ├── auth/          # NextAuth.js
│   │   ├── members/       # Área de membros
│   │   ├── market/        # Cotações da "Bolsa"
│   │   └── ...
│   ├── sobre/             # Página "Quem Somos" (inclui o Mapa Interativo)
│   ├── produtos/          # Vitrine pública de produtos
│   ├── noticias/          # Vitrine pública de notícias
│   ├── bolsa/             # Cotações de mercado
│   ├── login/, registro/  # Autenticação
│   ├── perfil/            # Perfil do usuário autenticado
│   ├── membros/           # Área exclusiva de membros
│   └── layout.tsx         # Layout raiz (idioma, providers, header/footer)
├── components/
│   ├── admin/             # Componentes usados só no painel admin
│   │   ├── ui/             # DataTable, Modal, ConfirmDialog (reutilizáveis)
│   │   └── FarmsManager.tsx # Aprovação de cadastros do mapa (novo)
│   ├── layout/             # Header, Footer
│   ├── sections/           # Seções de página (Hero, Notícias, etc.)
│   │   └── PigMap/          # Mapa Interativo de Suinocultura (novo)
│   ├── modals/             # Modais de visualização de conteúdo público
│   ├── providers/          # Contextos globais (idioma, auth, service worker)
│   └── i18n/               # Seletor de idioma
├── lib/                    # Utilitários
│   ├── mongodb.ts          # Conexão/cache de conexão com MongoDB
│   ├── auth.ts             # Configuração do NextAuth (credentials + OAuth)
│   ├── api-utils.ts        # Helpers de API (sessão, paginação, respostas)
│   ├── email.ts            # Envio de emails (Nodemailer)
│   └── i18n/               # Configuração de idiomas suportados
├── models/                 # Modelos Mongoose (User, Product, News, Farm, ...)
├── middleware.ts           # Auth, i18n por cookie/URL e rotas públicas de API
└── types/                  # Tipos TypeScript compartilhados
```

### Como o site funciona (visão geral)

- **Framework**: Next.js 14 com App Router. Cada pasta em `src/app` é uma rota; arquivos `page.tsx` são páginas e `route.ts` são endpoints de API.
- **Internacionalização**: o `middleware.ts` detecta o idioma (cookie `locale` ou cabeçalho `Accept-Language`), redireciona para `/pt/...` ou `/en/...` e reescreve internamente para a rota real. O hook `useLanguage()` (`components/providers/LanguageProvider.tsx`) expõe o idioma atual aos componentes client-side.
- **Autenticação**: NextAuth.js (`lib/auth.ts`) com estratégia de credenciais (email/senha) e adaptador MongoDB. Três papéis (`role`): `admin`, `member`, `visitor`.
- **Autorização/roteamento**: o `middleware.ts` decide, por prefixo de rota, se a página/endpoint é pública, exige apenas login, ou exige `role === 'admin'`. A lista `PUBLIC_API_PREFIXES` define quais rotas de API não exigem token.
- **Banco de dados**: MongoDB via Mongoose. `lib/mongodb.ts` mantém uma conexão em cache (padrão recomendado para Next.js serverless). Cada coleção tem um modelo em `src/models` e uma interface correspondente em `src/types/index.ts`.
- **Padrão das API Routes**: cada `route.ts` chama `connectDB()`, valida a sessão quando necessário (`validateSession`), sanitiza o corpo da requisição (`sanitizeInput`) e responde com os helpers `successResponse` / `errorResponse` de `lib/api-utils.ts`. Listagens usam `getPaginationParams` + `paginateResults` para paginação consistente.
- **Painel administrativo**: `app/admin/layout.tsx` protege todas as rotas `/admin/*` no servidor (redireciona se não for admin) e o `middleware.ts` reforça a mesma regra nas chamadas de API `/api/admin/*`. O menu lateral (`components/admin/AdminSidebar.tsx`) organiza os módulos de gestão; cada módulo tem um "Manager" (`components/admin/*Manager.tsx`) que consome a respectiva API e usa os componentes reutilizáveis `DataTable`, `Modal` e `ConfirmDialog` (`components/admin/ui/`).

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

### ✅ Fase 4 - Mapa Interativo de Suinocultura/Agricultura
- [x] Cadastro público de fazendas (formulário na aba "Sobre")
- [x] Moderação: cadastros ficam pendentes até aprovação de um admin
- [x] Mapa interativo de Angola com estatísticas agregadas por província
- [x] Painel admin para aprovar/rejeitar/remover cadastros

## 🗺️ Mapa Interativo de Suinocultura (Aba "Sobre")

Esta funcionalidade permite que produtores/suinocultores cadastrem a sua fazenda e que
qualquer visitante veja, num mapa de Angola, dados agregados de produção por província
(nº de produtores, total de porcos, fêmeas, disponíveis para abate e disponíveis para
reprodução/fertilização).

### Por que Leaflet + react-leaflet?

Foram consideradas três opções:

| Biblioteca | Prós | Contras |
| --- | --- | --- |
| **Leaflet / react-leaflet** ✅ escolhida | Leve (~40 KB gzip), open-source, sem chave de API, tiles gratuitos do OpenStreetMap, ótimo suporte a marcadores/popups interativos | Não vem com fronteiras administrativas prontas (resolvido usando marcadores por província) |
| Mapbox GL JS | Visual muito polido, suporte a estilos customizados | Exige conta e chave de API (token), tem limites de uso gratuito, bundle maior |
| react-simple-maps (TopoJSON) | Bom para "choropleth" (províncias coloridas) | Precisa de um ficheiro TopoJSON preciso das 21 províncias de Angola; sem esse ficheiro pronto, o risco de fronteiras incorretas é maior |

Como não tínhamos um ficheiro GeoJSON/TopoJSON oficial e verificado das 21 províncias de
Angola disponível no projeto, a implementação atual usa **marcadores (CircleMarker) na
capital/centro aproximado de cada província** — o que a própria especificação do pedido já
previa ("clicar em uma província... ou marcador"). Isso garante um mapa funcional e preciso
o suficiente sem depender de dados geográficos externos não verificados.

> **Evolução futura recomendada**: se a associação obtiver um GeoJSON oficial das províncias
> (por exemplo, do IGCA — Instituto Geográfico e Cadastral de Angola), é possível trocar os
> `CircleMarker` por um `<GeoJSON>` do react-leaflet e pintar cada província (choropleth) em
> vez de usar apenas um ponto central, sem alterar a API do backend.

### Modelo de dados (`src/models/Farm.ts`)

```ts
{
  producerName: string        // Nome do produtor (obrigatório)
  farmName?: string           // Nome da fazenda
  province: string            // Uma das 21 províncias de Angola (enum)
  municipality?: string
  coordinates?: { lat, lng }  // Opcional, se o produtor quiser um ponto exato
  phone?: string
  email?: string
  herd: {
    total: number             // Quantidade total de porcos (obrigatório)
    females: number           // Fêmeas
    forSlaughter: number      // Disponíveis para abate
    forBreeding: number       // Disponíveis para fertilização/reprodução
  }
  notes?: string
  status: 'pending' | 'approved' | 'rejected'  // Moderação
  owner?: ObjectId (User)     // Preenchido automaticamente se o produtor estiver logado
  isActive: boolean
}
```

A lista das 21 províncias (com coordenadas aproximadas usadas pelo mapa) está centralizada
em `src/components/sections/PigMap/angola-provinces.ts`, reaproveitando a mesma divisão
administrativa já usada no formulário de produtos (`admin/produtos/novo`).

**Por que moderação (`status: pending/approved/rejected`)?** Como o formulário de cadastro é
público (qualquer visitante pode preencher), os dados só entram nas estatísticas agregadas do
mapa depois de um administrador aprovar, evitando spam ou números incorretos distorcerem o
mapa público. Isso segue o mesmo padrão já usado no site para "Solicitações" de associação.

### Rotas / API

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/farms` | Público | Cria um novo cadastro de fazenda (status inicial `pending`) |
| `GET` | `/api/farms` | Público | Lista fazendas **aprovadas** (sem dados de contacto), com filtro opcional `?province=` |
| `GET` | `/api/farms/stats` | Público | Estatísticas agregadas por província (usado pelo mapa). Sempre retorna as 21 províncias, mesmo sem cadastros |
| `GET` | `/api/admin/farms` | Admin | Lista todos os cadastros, com filtro `?status=pending\|approved\|rejected` |
| `PATCH` | `/api/admin/farms/:id` | Admin | Aprova/rejeita ou edita um cadastro (`{ status }`, `{ herd }`, etc.) |
| `DELETE` | `/api/admin/farms/:id` | Admin | Remove um cadastro |

Exemplo de resposta de `GET /api/farms/stats`:

```json
{
  "success": true,
  "data": {
    "provinces": [
      { "province": "Luanda", "farmersCount": 3, "totalPigs": 540, "females": 210, "forSlaughter": 120, "forBreeding": 60 },
      { "province": "Huambo", "farmersCount": 0, "totalPigs": 0, "females": 0, "forSlaughter": 0, "forBreeding": 0 }
    ],
    "totals": { "farmersCount": 3, "totalPigs": 540, "females": 210, "forSlaughter": 120, "forBreeding": 60 }
  }
}
```

`/api/farms` foi adicionado à lista `PUBLIC_API_PREFIXES` em `src/middleware.ts`, para que o
formulário público e o mapa funcionem sem exigir login.

### Componentes de Frontend

Todos em `src/components/sections/PigMap/`:

- **`angola-provinces.ts`** — lista das 21 províncias com coordenadas (lat/lng) e centro/zoom padrão do mapa.
- **`PigFarmMap.tsx`** — o mapa em si (Leaflet). Carrega o `TileLayer` do OpenStreetMap e desenha um `CircleMarker` por província: raio e cor proporcionais ao total de porcos (cinza = sem cadastros ainda). Ao clicar, abre um `Popup` com as estatísticas da região e um botão "Cadastrar fazenda nesta província".
- **`FarmRegisterModal.tsx`** — modal com o formulário de cadastro (produtor, fazenda, província, telefone/email, e os 4 campos do rebanho). Envia `POST /api/farms` e mostra mensagem de sucesso ("aguardando aprovação").
- **`InteractiveMapSection.tsx`** — componente "orquestrador": busca `/api/farms/stats`, mostra os 5 cartões de totais (produtores, total de porcos, fêmeas, abate, reprodução), renderiza o mapa (via `next/dynamic` com `ssr: false`, pois o Leaflet precisa do `window`) e controla a abertura do modal de cadastro (tanto pelo botão principal "Cadastrar minha fazenda" quanto pelo botão dentro do popup de cada província).

No lado do admin: `src/components/admin/FarmsManager.tsx` (listagem com filtro por status,
aprovar/rejeitar/remover) e a página `src/app/admin/suinocultura/page.tsx`, acessível pelo
item "Suinocultura" no menu lateral do painel.

### Passo a passo: como o formulário se conecta ao mapa

1. **Visitante abre `/sobre`** → `AboutClient.tsx` renderiza `<InteractiveMapSection />` perto do fim da página.
2. **`InteractiveMapSection` busca `GET /api/farms/stats`** assim que monta, e guarda o resultado (`provinces` + `totals`) em estado local.
3. **O mapa é desenhado** com um marcador por província, usando os dados já carregados — sem chamadas adicionais por província (tudo vem numa única requisição agregada).
4. **O visitante clica em "Cadastrar minha fazenda"** (botão principal) **ou** no botão "Cadastrar fazenda nesta província" dentro do popup de um marcador → abre `FarmRegisterModal`, já com a província pré-selecionada no segundo caso.
5. **O produtor preenche o formulário** (nome, fazenda, província, rebanho) e submete → `POST /api/farms` cria o registo com `status: 'pending'` no MongoDB (coleção `farms`).
6. **Um administrador entra em `/admin/suinocultura`**, revê os cadastros pendentes e clica em "Aprovar" → `PATCH /api/admin/farms/:id` muda o `status` para `approved`.
7. **Da próxima vez que o mapa recarregar** `/api/farms/stats` (ex.: o visitante atualiza a página, ou o próprio `onRegistered` chama `loadStats()` logo após o envio para refletir already-visible totals se o admin aprovar rapidamente), os números da província aprovada passam a contar nas estatísticas agregadas e o marcador correspondente cresce/muda de cor no mapa.

### Como testar localmente

```bash
npm install            # instala leaflet, react-leaflet e @types/leaflet (adicionados ao package.json)
npm run dev
```

1. Acesse `http://localhost:3000/sobre` e role até "Mapa Interativo".
2. Clique em "Cadastrar minha fazenda" e envie um cadastro de teste.
3. Entre com uma conta admin, vá a **Admin → Suinocultura** e aprove o cadastro.
4. Volte a `/sobre` e recarregue: o marcador da província escolhida deve refletir os novos números.

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
- **Quem Somos / Sobre**: Informações sobre a associação. No submenu você encontra também a página de Colaboradores. Nesta página está também o **Mapa Interativo de Suinocultura**: você pode ver estatísticas por província e cadastrar a sua própria fazenda clicando em "Cadastrar minha fazenda" (o cadastro fica visível no mapa após aprovação da equipa da associação).
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
- **Suinocultura**: Aprovar, rejeitar ou remover cadastros de fazendas enviados pelos produtores através do Mapa Interativo na página "Sobre". Apenas cadastros aprovados entram nas estatísticas públicas do mapa.
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

- **Aprovar cadastro de fazenda (Mapa Interativo)**:
  1) Ir em Suinocultura.
  2) Revisar os dados do produtor e do rebanho na lista "Pendente".
  3) Clicar em Aprovar (✔) para publicar no mapa, ou Rejeitar (✖) caso os dados sejam inválidos.

- **Enviar e usar imagens**:
  1) Ir em Mídia e fazer upload da imagem.
  2) Ao criar conteúdo (ex.: notícia), selecione a imagem enviada.

#### Dicas Rápidas

- As notificações de sucesso/erro aparecem no topo da tela.
- Use a busca do painel para encontrar rapidamente registros.
- Para sair do painel, abra o menu do usuário no topo e clique em Sair.
