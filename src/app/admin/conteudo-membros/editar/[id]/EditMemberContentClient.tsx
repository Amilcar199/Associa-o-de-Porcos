'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText,
  Video, 
  BookOpen, 
  Calendar,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface FormData {
  title: string
  description: string
  type: 'document' | 'video' | 'article' | 'event'
  category: string
  content: string
  url?: string
  thumbnail?: string
  fileUrl?: string
  videoUrl?: string
  eventDate?: string
  eventLocation?: string
  isFeatured: boolean
  tags: string[]
}

interface EditMemberContentClientProps {
  contentId: string
}

export default function EditMemberContentClient({ contentId }: EditMemberContentClientProps) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'document',
    category: '',
    content: '',
    url: '',
    thumbnail: '',
    fileUrl: '',
    videoUrl: '',
    eventDate: '',
    eventLocation: '',
    isFeatured: false,
    tags: []
  })
  const [newTag, setNewTag] = useState('')

  const categories = {
    document: ['Técnico', 'Saúde', 'Nutrição', 'Sanidade', 'Reprodução'],
    video: ['Técnico', 'Educacional', 'Nutrição', 'Sanidade'],
    article: ['Técnico', 'Mercado', 'Educacional', 'Saúde'],
    event: ['Evento', 'Workshop', 'Seminário', 'Treinamento']
  }

  useEffect(() => {
    fetchContent()
  }, [contentId])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/admin/member-content/${contentId}`)
      if (response.ok) {
        const data = await response.json()
        const content = data.data
        
        // Converter data para formato do input datetime-local
        let eventDate = ''
        if (content.eventDate) {
          const date = new Date(content.eventDate)
          eventDate = date.toISOString().slice(0, 16)
        }

        setFormData({
          title: content.title || '',
          description: content.description || '',
          type: content.type || 'document',
          category: content.category || '',
          content: content.content || '',
          url: content.url || '',
          thumbnail: content.thumbnail || '',
          fileUrl: content.fileUrl || '',
          videoUrl: content.videoUrl || '',
          eventDate,
          eventLocation: content.eventLocation || '',
          isFeatured: content.isFeatured || false,
          tags: content.tags || []
        })
      } else {
        showError('Erro ao carregar conteúdo')
        router.push('/admin/conteudo-membros')
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error)
      showError('Erro ao carregar conteúdo')
      router.push('/admin/conteudo-membros')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/member-content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess('Conteúdo atualizado com sucesso!')
        router.push('/admin/conteudo-membros')
      } else {
        const error = await response.json()
        showError(error.message || 'Erro ao atualizar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error)
      showError('Erro ao atualizar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleTypeChange = (newType: 'document' | 'video' | 'article' | 'event') => {
    setFormData(prev => ({ 
      ...prev, 
      type: newType,
      category: '',
      url: '',
      fileUrl: '',
      videoUrl: '',
      eventDate: '',
      eventLocation: ''
    }))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando conteúdo...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conteúdo *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'document', icon: FileText, label: 'Documento' },
                { value: 'video', icon: Video, label: 'Vídeo' },
                { value: 'article', icon: BookOpen, label: 'Artigo' },
                { value: 'event', icon: Calendar, label: 'Evento' }
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value as any)}
                  className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    formData.type === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories[formData.type]?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Título e Descrição */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ex.: Manual de Boas Práticas na Criação de Porcos"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descrição breve do conteúdo..."
              rows={3}
              required
              maxLength={1000}
            />
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo Principal
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Conteúdo detalhado, instruções, etc..."
            rows={6}
            maxLength={10000}
          />
        </div>

        {/* URLs e Arquivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.type === 'document' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Arquivo
              </label>
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://exemplo.com/arquivo.pdf"
              />
            </div>
          )}

          {formData.type === 'video' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Vídeo
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {formData.type === 'event' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Evento
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventLocation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex.: Auditório da Associação, Luanda"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Externa (opcional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Thumbnail
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (máximo 10)
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Adicionar tag..."
                maxLength={50}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || formData.tags.length >= 10}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opções */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Destacar este conteúdo</span>
          </label>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/admin/conteudo-membros')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}