const mongoose = require('mongoose')
const MemberContent = require('../src/models/MemberContent.js')
const User = require('../src/models/User.js')
require('dotenv').config({ path: '.env.local' })

async function initMemberContent() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado ao MongoDB')

    // Buscar um usuário admin para ser o autor
    const adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado. Execute primeiro o script init-db.js')
      process.exit(1)
    }

    // Verificar se já existe conteúdo
    const existingContent = await MemberContent.countDocuments()
    if (existingContent > 0) {
      console.log('ℹ️  Conteúdo de membros já existe. Pulando inicialização...')
      process.exit(0)
    }

    // Dados reais para conteúdo de membros
    const memberContentData = [
      {
        title: 'Manual de Boas Práticas na Criação de Porcos',
        description: 'Guia completo com as melhores práticas para criação sustentável e eficiente de suínos, incluindo manejo, alimentação e saúde.',
        type: 'document',
        category: 'Técnico',
        content: 'Este manual abrange todos os aspectos da criação de porcos, desde a seleção de reprodutores até o abate. Inclui protocolos de vacinação, manejo nutricional e biosseguridade.',
        fileUrl: '/documents/manual-boas-praticas.pdf',
        thumbnail: '/images/manual-thumb.jpg',
        isFeatured: true,
        tags: ['criação', 'manejo', 'saúde', 'nutrição'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Webinar: Nutrição Avançada para Suínos',
        description: 'Palestra especializada sobre nutrição e suplementação para diferentes fases de desenvolvimento dos suínos.',
        type: 'video',
        category: 'Educacional',
        content: 'Webinar completo sobre nutrição avançada, incluindo formulação de rações, suplementação vitamínica e mineral.',
        videoUrl: 'https://youtube.com/watch?v=nutricao-avancada',
        thumbnail: '/images/webinar-thumb.jpg',
        isFeatured: true,
        tags: ['nutrição', 'alimentação', 'suplementação', 'webinar'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Tendências do Mercado Suíno 2024',
        description: 'Análise completa das tendências e oportunidades no mercado angolano de suínos, incluindo preços e demanda.',
        type: 'article',
        category: 'Mercado',
        content: 'Análise detalhada do mercado suíno em Angola, incluindo tendências de preços, demanda do consumidor e oportunidades de negócio.',
        url: '/articles/tendencias-mercado-2024',
        thumbnail: '/images/mercado-thumb.jpg',
        isFeatured: false,
        tags: ['mercado', 'tendências', 'preços', 'demanda', 'oportunidades'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Workshop de Sanidade Animal',
        description: 'Evento presencial sobre prevenção de doenças e biosseguridade na criação de suínos.',
        type: 'event',
        category: 'Evento',
        content: 'Workshop prático sobre sanidade animal, incluindo demonstrações de procedimentos de biosseguridade.',
        url: '/events/workshop-sanidade',
        thumbnail: '/images/workshop-thumb.jpg',
        isFeatured: true,
        tags: ['sanidade', 'biosseguridade', 'prevenção', 'workshop'],
        eventDate: new Date('2024-03-15T09:00:00Z'),
        eventLocation: 'Centro de Formação Agrícola, Luanda'
      },
      {
        title: 'Protocolo de Vacinação Completo',
        description: 'Documento detalhado com todos os protocolos de vacinação recomendados para suínos em diferentes fases.',
        type: 'document',
        category: 'Saúde',
        content: 'Protocolo completo de vacinação incluindo calendário, doses, vias de administração e controle de reações.',
        fileUrl: '/documents/protocolo-vacinacao.pdf',
        thumbnail: '/images/vacinacao-thumb.jpg',
        isFeatured: false,
        tags: ['vacinação', 'saúde', 'protocolo', 'calendário'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Técnicas de Melhoramento Genético',
        description: 'Vídeo explicativo sobre seleção e melhoramento genético em suínos para produção de qualidade.',
        type: 'video',
        category: 'Técnico',
        content: 'Técnicas avançadas de melhoramento genético, incluindo seleção de reprodutores e cruzamentos.',
        videoUrl: 'https://youtube.com/watch?v=melhoramento-genetico',
        thumbnail: '/images/genetica-thumb.jpg',
        isFeatured: false,
        tags: ['genética', 'melhoramento', 'seleção', 'reprodutores'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Guia de Reprodução e Fertilidade',
        description: 'Manual completo sobre técnicas de reprodução, inseminação artificial e gestão da fertilidade.',
        type: 'document',
        category: 'Reprodução',
        content: 'Guia prático sobre reprodução de suínos, incluindo sincronização de cio e inseminação artificial.',
        fileUrl: '/documents/guia-reproducao.pdf',
        thumbnail: '/images/reproducao-thumb.jpg',
        isFeatured: true,
        tags: ['reprodução', 'fertilidade', 'inseminação', 'sincronização'],
        eventDate: null,
        eventLocation: null
      },
      {
        title: 'Seminário de Comercialização',
        description: 'Evento sobre estratégias de comercialização e acesso a mercados para produtores de suínos.',
        type: 'event',
        category: 'Comercial',
        content: 'Seminário sobre estratégias de comercialização, incluindo certificações e acesso a mercados premium.',
        url: '/events/seminario-comercializacao',
        thumbnail: '/images/comercial-thumb.jpg',
        isFeatured: false,
        tags: ['comercialização', 'mercados', 'certificações', 'estratégias'],
        eventDate: new Date('2024-04-20T14:00:00Z'),
        eventLocation: 'Auditório da Associação, Luanda'
      }
    ]

    // Criar conteúdo de membros
    const createdContent = await MemberContent.insertMany(
      memberContentData.map(content => ({
        ...content,
        author: adminUser._id,
        isActive: true,
        views: Math.floor(Math.random() * 100),
        downloads: content.type === 'document' ? Math.floor(Math.random() * 50) : 0
      }))
    )

    console.log(`✅ ${createdContent.length} conteúdos de membros criados com sucesso!`)
    
    // Listar conteúdo criado
    console.log('\n📋 Conteúdo criado:')
    createdContent.forEach((content, index) => {
      console.log(`${index + 1}. ${content.title} (${content.type})`)
    })

    console.log('\n🎉 Inicialização de conteúdo de membros concluída!')
    console.log('💡 Agora você pode acessar /admin/conteudo-membros para gerenciar o conteúdo')

  } catch (error) {
    console.error('❌ Erro ao inicializar conteúdo de membros:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado do MongoDB')
    process.exit(0)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initMemberContent()
}

module.exports = initMemberContent