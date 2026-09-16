'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Video,
  BookOpen,
  Calendar,
  Users,
  Award,
  Star,
  MessageCircle,
  Download,
  Inbox,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';

import { useLanguage } from '@/components/providers/LanguageProvider';
import MemberContentModal from '@/components/modals/MemberContentModal'

interface MemberContent {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'article' | 'event';
  category: string;
  url?: string;
  thumbnail?: string;
  createdAt: string;
  isFeatured: boolean;
  content?: string;
  fileUrl?: string;
  videoUrl?: string;
  eventDate?: string;
  eventLocation?: string;
}

const TYPE_META: Record<string, { icon: any; badge: string }> = {
  document: { icon: FileText, badge: 'bg-blue-100 text-blue-800' },
  video: { icon: Video, badge: 'bg-purple-100 text-purple-800' },
  article: { icon: BookOpen, badge: 'bg-green-100 text-green-800' },
  event: { icon: Calendar, badge: 'bg-orange-100 text-orange-800' },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
}

export default function MembersArea() {
  const { locale } = useLanguage();
  const isEn = locale.startsWith('en');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState([] as MemberContent[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<MemberContent | null>(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalVideos: 0,
    totalEvents: 0,
    membershipLevel: 'Básico'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }
    if (session.user?.role === 'visitor') { router.push('/perfil'); return; }
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

  const filteredContent = content.filter((item: MemberContent) => {
    if (activeTab === 'overview') return true;
    return item.type === activeTab;
  });

  const openModal = (item: MemberContent) => {
    setSelectedContent(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedContent(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-100 border-t-primary-600"></div>
      </div>
    );
  }

  if (!session) { return null; }

  const tabs = [
    { key: 'overview', label: isEn ? 'Overview' : 'Visão Geral', icon: LayoutGrid },
    { key: 'document', label: isEn ? 'Documents' : 'Documentos', icon: FileText },
    { key: 'video', label: isEn ? 'Videos' : 'Vídeos', icon: Video },
    { key: 'article', label: isEn ? 'Articles' : 'Artigos', icon: BookOpen },
    { key: 'event', label: isEn ? 'Events' : 'Eventos', icon: Calendar },
  ]

  const statCards = [
    { label: isEn ? 'Documents' : 'Documentos', value: stats.totalDocuments, icon: FileText, color: 'blue' },
    { label: isEn ? 'Videos' : 'Vídeos', value: stats.totalVideos, icon: Video, color: 'purple' },
    { label: isEn ? 'Events' : 'Eventos', value: stats.totalEvents, icon: Calendar, color: 'orange' },
    { label: isEn ? 'Benefits' : 'Benefícios', value: '+15', icon: Award, color: 'green' },
  ]

  const colorClasses: Record<string, { light: string; text: string }> = {
    blue: { light: 'bg-blue-50', text: 'text-blue-600' },
    purple: { light: 'bg-purple-50', text: 'text-purple-600' },
    orange: { light: 'bg-orange-50', text: 'text-orange-600' },
    green: { light: 'bg-green-50', text: 'text-green-600' },
  }

  const benefits = [
    { icon: Star, title: isEn ? 'Exclusive Content' : 'Conteúdo Exclusivo', desc: isEn ? 'Access to exclusive materials and resources' : 'Acesso a materiais e recursos exclusivos' },
    { icon: Calendar, title: isEn ? 'Priority Events' : 'Eventos Prioritários', desc: isEn ? 'Participation in events and workshops' : 'Participação em eventos e workshops' },
    { icon: MessageCircle, title: isEn ? 'Specialized Support' : 'Suporte Especializado', desc: isEn ? 'Consulting and technical guidance' : 'Consultoria e orientação técnica' },
    { icon: Users, title: 'Networking', desc: isEn ? 'Connections with other professionals' : 'Conexões com outros profissionais' },
    { icon: FileText, title: isEn ? 'Documentation' : 'Documentação', desc: isEn ? 'Manuals and technical guides' : 'Manuais e guias técnicos' },
    { icon: Award, title: isEn ? 'Certifications' : 'Certificações', desc: isEn ? 'Professional certification programs' : 'Programas de certificação profissional' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm mb-3">
                <ShieldCheck size={14} /> {isEn ? 'Members Area' : 'Área de Membros'}
              </span>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold">
                {isEn ? 'Welcome back' : 'Bem-vindo(a) de volta'}{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-primary-100 mt-2 max-w-xl">
                {isEn ? 'Exclusive content for association members' : 'Conteúdo exclusivo para membros da associação'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 self-start">
              <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs text-primary-100">{isEn ? 'Membership Level' : 'Nível de Associação'}</p>
                <p className="text-lg font-semibold">{stats.membershipLevel}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, idx) => {
            const colors = colorClasses[card.color]
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-xl ${colors.light} flex items-center justify-center shrink-0`}>
                  <card.icon size={20} className={colors.text} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-xs text-gray-500">{card.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs + Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex overflow-x-auto no-scrollbar px-3 sm:px-4 gap-1 py-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {filteredContent.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-14">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{isEn ? 'No content found' : 'Nenhum conteúdo encontrado'}</h3>
                  <p className="text-gray-500 text-sm">{isEn ? 'We will have exclusive content for you soon!' : 'Em breve teremos conteúdo exclusivo para você!'}</p>
                </motion.div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map((item: MemberContent, idx) => {
                    const itemId = (item as any).id || (item as any)._id || item.title;
                    const meta = TYPE_META[item.type] || TYPE_META.document
                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                        className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => openModal(item)}
                      >
                        {item.thumbnail ? (
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-50 flex items-center justify-center">
                            <meta.icon size={32} className="text-gray-300" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.badge}`}>
                              <meta.icon size={12} />
                              <span className="capitalize">{item.type}</span>
                            </span>
                            {item.isFeatured && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-2">{item.title}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(isEn ? 'en-US' : 'pt-AO')}</span>
                            {item.url && (
                              <a
                                href={item.url}
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                  e.stopPropagation();
                                  const idVal = (item as any).id || (item as any)._id;
                                  try {
                                    const beaconUrl = idVal ? `/api/members/content/${idVal}/download` : '';
                                    if (beaconUrl) {
                                      if (navigator.sendBeacon) {
                                        navigator.sendBeacon(beaconUrl);
                                      } else {
                                        fetch(beaconUrl, { method: 'POST', keepalive: true });
                                      }
                                    }
                                  } catch {}
                                }}
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                              >
                                <Download size={14} />
                                {isEn ? 'Access' : 'Acessar'}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">{isEn ? 'Association Benefits' : 'Benefícios da Associação'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <benefit.icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Conteúdo */}
      <MemberContentModal isOpen={modalOpen} onClose={closeModal} data={selectedContent} isEn={isEn} />
    </div>
  );
}
