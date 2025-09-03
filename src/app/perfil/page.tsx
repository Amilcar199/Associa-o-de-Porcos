'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Settings, History, Shield, LogOut } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import HeaderLanguageMenu from '@/components/i18n/HeaderLanguageMenu'
import pt from '@/lib/i18n/dictionaries/pt';
import en from '@/lib/i18n/dictionaries/en';
import ImageUpload from '@/components/admin/ui/ImageUpload';
import { X } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone?: string;
  company?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { locale } = useLanguage();
  const dict = locale.startsWith('en') ? en : pt;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    bio: '',
    location: '',
    website: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: true
    }
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', { credentials: 'include', cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setFormData({
          name: data.data.name || '',
          phone: data.data.phone || '',
          company: data.data.company || '',
          bio: data.data.bio || '',
          location: data.data.location || '',
          website: data.data.website || '',
          socialMedia: {
            linkedin: data.data.socialMedia?.linkedin || '',
            twitter: data.data.socialMedia?.twitter || '',
            facebook: data.data.socialMedia?.facebook || ''
          },
          preferences: {
            emailNotifications: data.data.preferences?.emailNotifications ?? true,
            smsNotifications: data.data.preferences?.smsNotifications ?? false,
            newsletter: data.data.preferences?.newsletter ?? true
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        alert('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ avatar: imageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
    }
  };

  useEffect(() => {
    const loadActivity = async () => {
      setActivityLoading(true)
      try {
        const res = await fetch('/api/user/activity', { credentials: 'include', cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          setActivity(j.data || [])
        }
      } catch {}
      setActivityLoading(false)
    }
    if (session) loadActivity()
  }, [session])

  const submitPasswordChange = async () => {
    setPwError('');
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('Preencha todos os campos');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('As senhas não coincidem');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/user/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const j = await res.json();
      if (res.ok) {
        alert('Senha alterada com sucesso!');
        setShowPasswordModal(false);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwError(j.error || 'Erro ao alterar senha');
      }
    } catch (e) {
      setPwError('Erro ao alterar senha');
    } finally {
      setPwLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{dict.profile.pageTitle}</h1>
          <p className="text-gray-600">{dict.profile.pageSubtitle}</p>
        </div>

        {/* Upgrade Banner for Visitors */}
        {session.user?.role === 'visitor' && (
          <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <div className="ml-0">
                <p className="text-sm text-yellow-800">
                  {locale.startsWith('en')
                    ? 'You are currently a Client (Visitor). Become an Association Member to access exclusive content and benefits.'
                    : 'Você é atualmente um Cliente (Visitante). Torne-se Membro da Associação para acessar conteúdos e benefícios exclusivos.'}
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/user/membership-request', { method: 'POST' })
                        if (res.ok) {
                          alert(locale.startsWith('en') ? 'Request sent successfully!' : 'Solicitação enviada com sucesso!')
                        } else {
                          const j = await res.json().catch(() => ({}))
                          alert(j.error || (locale.startsWith('en') ? 'Error sending request' : 'Erro ao enviar solicitação'))
                        }
                      } catch (e) {
                        alert(locale.startsWith('en') ? 'Error sending request' : 'Erro ao enviar solicitação')
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    {locale.startsWith('en') ? 'Request Membership' : 'Solicitar Associação'}
                  </button>
                  <a
                    href="/membros"
                    className="inline-flex items-center px-3 py-1.5 rounded-md border text-sm text-green-700 border-green-200 hover:bg-green-50"
                  >
                    {locale.startsWith('en') ? 'Learn more' : 'Saiba mais'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="inline-block w-4 h-4 mr-2" />
                {dict.profile.tabs.profile}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="inline-block w-4 h-4 mr-2" />
                {dict.profile.tabs.settings}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="inline-block w-4 h-4 mr-2" />
                {dict.profile.tabs.security}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="inline-block w-4 h-4 mr-2" />
                Atividades
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      className="h-24 w-24 rounded-full object-cover"
                      src={profile?.avatar || '/default-avatar.png'}
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{dict.profile.avatarTitle}</h3>
                    <p className="text-sm text-gray-500">{dict.profile.avatarSubtitle}</p>
                    <ImageUpload
                      onImageUploaded={handleImageUploaded}
                      label={dict.profile.uploadLabel}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.profile.name}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.auth.email}
                    </label>
                    <input
                      type="email"
                      value={session.user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.profile.phone}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.profile.company}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.profile.location}
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={dict.profile.locationPlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {dict.profile.website}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={dict.profile.websitePlaceholder}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {dict.profile.bio}
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={dict.profile.bioPlaceholder}
                  />
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">{dict.profile.social}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? dict.profile.saving : dict.profile.saveChanges}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{dict.profile.preferencesTitle}</h3>
                
                <div className="space-y-4">
                  {/* Idioma */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Idioma</h4>
                      <p className="text-sm text-gray-500">Selecione o idioma de navegação</p>
                    </div>
                    <HeaderLanguageMenu />
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{dict.profile.emailNotif.title}</h4>
                      <p className="text-sm text-gray-500">{dict.profile.emailNotif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.emailNotifications}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, emailNotifications: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{dict.profile.smsNotif.title}</h4>
                      <p className="text-sm text-gray-500">{dict.profile.smsNotif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.smsNotifications}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, smsNotifications: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{dict.profile.newsletter.title}</h4>
                      <p className="text-sm text-gray-500">{dict.profile.newsletter.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.newsletter}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, newsletter: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? dict.profile.saving : dict.profile.savePreferences}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{dict.profile.securityTitle}</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">{dict.profile.securityTipsTitle}</h4>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          {dict.profile.securityTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{dict.profile.changePasswordTitle}</h4>
                    <p className="text-sm text-gray-500 mb-4">{dict.profile.changePasswordDesc}</p>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {dict.profile.changePasswordBtn}
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">{dict.profile.sessionsTitle}</h4>
                    <p className="text-sm text-gray-500 mb-4">{dict.profile.sessionsDesc}</p>
                    <button
                      onClick={() => setShowSessionsModal(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      {dict.profile.sessionsBtn}
                    </button>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-900 mb-2">{dict.profile.dangerZoneTitle}</h4>
                    <p className="text-sm text-red-700 mb-4">{dict.profile.dangerZoneDesc}</p>
                    <button
                      onClick={async () => {
                        const confirmDelete = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
                        if (!confirmDelete) return;
                        try {
                          const res = await fetch('/api/user/security/delete', {
                            method: 'DELETE',
                            credentials: 'include'
                          });
                          const j = await res.json();
                          if (res.ok) {
                            alert('Conta excluída com sucesso.');
                            await signOut({ callbackUrl: '/' });
                          } else {
                            alert(j.error || 'Erro ao excluir conta');
                          }
                        } catch (e) {
                          alert('Erro ao excluir conta');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {dict.profile.deleteAccountBtn}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Atividade da conta</h3>
                {activityLoading ? (
                  <div className="text-sm text-gray-500">Carregando...</div>
                ) : activity.length === 0 ? (
                  <div className="text-sm text-gray-500">Sem registros.</div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User-Agent</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activity.map((log, idx) => (
                          <tr key={log._id || idx}>
                            <td className="px-4 py-2 text-sm text-gray-700">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{log.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{log.ip || '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 truncate max-w-xs" title={log.userAgent}>{log.userAgent || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      <PasswordModal
        open={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); setPwError(''); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}
        onSubmit={submitPasswordChange}
        loading={pwLoading}
        error={pwError}
        values={pwForm}
        setValues={setPwForm}
      />
      <ConfirmSessionsModal
        open={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
        loading={pwLoading}
        onConfirm={async () => {
          setPwLoading(true)
          try {
            const res = await fetch('/api/user/security/sessions', { method: 'POST', credentials: 'include' })
            const j = await res.json();
            if (res.ok) alert('Sessões encerradas em outros dispositivos.'); else alert(j.error || 'Erro ao encerrar sessões');
            setShowSessionsModal(false)
          } catch (e) {
            alert('Erro ao encerrar sessões');
          } finally {
            setPwLoading(false)
          }
        }}
      />
    </div>
  );
}
/* Render modals at root */
// @ts-ignore
// eslint-disable-next-line
(function ModalsHost(){return null})

// Modals
function PasswordModal({ open, onClose, onSubmit, loading, error, values, setValues }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Alterar senha</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
            <input type="password" value={values.currentPassword} onChange={(e)=>setValues((v:any)=>({...v,currentPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input type="password" value={values.newPassword} onChange={(e)=>setValues((v:any)=>({...v,newPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input type="password" value={values.confirmPassword} onChange={(e)=>setValues((v:any)=>({...v,confirmPassword:e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={onSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  )
}

function ConfirmSessionsModal({ open, onClose, onConfirm, loading }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Encerrar outras sessões</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 text-sm text-gray-700">
          Isso irá encerrar sessões ativas em outros dispositivos e navegadores. Você permanecerá logado neste dispositivo.
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">{loading ? 'Processando...' : 'Encerrar sessões'}</button>
        </div>
      </div>
    </div>
  )
}
