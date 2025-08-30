'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Download, 
  Video, 
  BookOpen,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface MemberContent {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'article' | 'event';
  category: string;
  url?: string;
  thumbnail?: string;
  createdAt: string;
  isFeatured: boolean;
}

export default function MembersArea() {
  const { locale } = useLanguage();
  const isEn = locale.startsWith('en');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState<MemberContent[]>([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalVideos: 0,
    totalEvents: 0,
    membershipLevel: 'Básico'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    if (session.user?.role === 'visitor') { router.push('/'); return; }
    fetchMemberContent();
    fetchMemberStats();
  }, [session, status]);

  const fetchMemberContent = async () => {
    try {
      const response = await fetch('/api/members/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data.data || []);
      }
    } catch (error) {
      console.error(isEn ? 'Error fetching content:' : 'Erro ao buscar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async () => {
    try {
      const response = await fetch('/api/members/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      }
    } catch (error) {
      console.error(isEn ? 'Error fetching stats:' : 'Erro ao buscar estatísticas:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'article': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = content.filter(item => {
    if (activeTab === 'overview') return true;
    return item.type === activeTab;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) { return null; }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner de verificação */}
        {!((session.user as any)?.emailVerified) && (
          <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-center justify-between">
            <div>
              {isEn ? 'Please verify your email to unlock all member features.' : 'Verifique seu email para liberar todas as funcionalidades de membro.'}
            </div>
            <button
              onClick={async ()=>{ await fetch('/api/auth/resend-code',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: session.user?.email }) }) }}
              className="text-yellow-900 underline font-medium"
            >
              {isEn ? 'Resend code' : 'Reenviar código'}
            </button>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isEn ? 'Members Area' : 'Área de Membros'}</h1>
              <p className="text-gray-600">{isEn ? 'Exclusive content for association members' : 'Conteúdo exclusivo para membros da associação'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{isEn ? 'Membership Level' : 'Nível de Associação'}</p>
                <p className="text-lg font-semibold text-green-600">{stats.membershipLevel}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{isEn ? 'Documents' : 'Documentos'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{isEn ? 'Videos' : 'Vídeos'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{isEn ? 'Events' : 'Eventos'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{isEn ? 'Benefits' : 'Benefícios'}</p>
                <p className="text-2xl font-bold text-gray-900">+15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button onClick={() => setActiveTab('overview')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <TrendingUp className="inline-block w-4 h-4 mr-2" />
                {isEn ? 'Overview' : 'Visão Geral'}
              </button>
              <button onClick={() => setActiveTab('document')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'document' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <FileText className="inline-block w-4 h-4 mr-2" />
                {isEn ? 'Documents' : 'Documentos'}
              </button>
              <button onClick={() => setActiveTab('video')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'video' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Video className="inline-block w-4 h-4 mr-2" />
                {isEn ? 'Videos' : 'Vídeos'}
              </button>
              <button onClick={() => setActiveTab('article')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'article' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <BookOpen className="inline-block w-4 h-4 mr-2" />
                {isEn ? 'Articles' : 'Artigos'}
              </button>
              <button onClick={() => setActiveTab('event')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'event' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <Calendar className="inline-block w-4 h-4 mr-2" />
                {isEn ? 'Events' : 'Eventos'}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{isEn ? 'No content found' : 'Nenhum conteúdo encontrado'}</h3>
                <p className="text-gray-500">{isEn ? 'We will have exclusive content for you soon!' : 'Em breve teremos conteúdo exclusivo para você!'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {item.thumbnail && (
                      <div className="aspect-video bg-gray-200">
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContentColor(item.type)}`}>
                          {getContentIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </span>
                        {item.isFeatured && (<Star className="w-4 h-4 text-yellow-500" />)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString(isEn ? 'en-US' : 'pt-AO')}</span>
                        {item.url && (
                          ((session.user as any)?.emailVerified ? (
                            <a href={item.url} className="inline-flex items-center text-sm text-green-600 hover:text-green-700">
                              <Download className="w-4 h-4 mr-1" />
                              {isEn ? 'Access' : 'Acessar'}
                            </a>
                          ) : (
                            <button disabled className="inline-flex items-center text-sm text-gray-400 cursor-not-allowed" title={isEn ? 'Verify your email to access' : 'Verifique seu email para acessar'}>
                              <Download className="w-4 h-4 mr-1" />
                              {isEn ? 'Access' : 'Acessar'}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{isEn ? 'Association Benefits' : 'Benefícios da Associação'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{isEn ? 'Exclusive Content' : 'Conteúdo Exclusivo'}</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Access to exclusive materials and resources' : 'Acesso a materiais e recursos exclusivos'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{isEn ? 'Priority Events' : 'Eventos Prioritários'}</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Participation in events and workshops' : 'Participação em eventos e workshops'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{isEn ? 'Specialized Support' : 'Suporte Especializado'}</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Consulting and technical guidance' : 'Consultoria e orientação técnica'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Networking</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Connections with other professionals' : 'Conexões com outros profissionais'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{isEn ? 'Documentation' : 'Documentação'}</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Manuals and technical guides' : 'Manuais e guias técnicos'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{isEn ? 'Certifications' : 'Certificações'}</h4>
                <p className="text-sm text-gray-500">{isEn ? 'Professional certification programs' : 'Programas de certificação profissional'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
