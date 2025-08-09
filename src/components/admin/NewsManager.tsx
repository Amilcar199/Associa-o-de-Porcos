'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import DataTable from './ui/DataTable';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import ImageUpload from './ui/ImageUpload';

interface News {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  imageUrl?: string;
  author: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  author: string;
  isPublished: boolean;
}

export default function NewsManager() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    imageUrl: '',
    author: '',
    isPublished: false
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingNews ? `/api/news/${editingNews._id}` : '/api/news';
      const method = editingNews ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingNews(null);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      excerpt: newsItem.excerpt,
      category: newsItem.category,
      imageUrl: newsItem.imageUrl || '',
      author: newsItem.author,
      isPublished: newsItem.isPublished
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    try {
      const response = await fetch(`/api/news/${newsToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNews(news.filter(n => n._id !== newsToDelete._id));
      }
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
    } finally {
      setNewsToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      imageUrl: '',
      author: '',
      isPublished: false
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const filteredNews = news.filter(newsItem => {
    const matchesSearch = newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         newsItem.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || newsItem.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(news.map(n => n.category))];

  const columns = [
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoria' },
    { key: 'author', label: 'Autor' },
    { key: 'views', label: 'Visualizações' },
    { key: 'isPublished', label: 'Status' },
    { key: 'createdAt', label: 'Data' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatStatus = (isPublished: boolean) => {
    return isPublished ? (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
        Publicado
      </span>
    ) : (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
        Rascunho
      </span>
    );
  };

  const tableData = filteredNews.map(newsItem => ({
    ...newsItem,
    createdAt: formatDate(newsItem.createdAt),
    isPublished: formatStatus(newsItem.isPublished)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Notícias</h2>
          <p className="text-gray-600">Gerencie as notícias do site</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          <span>Adicionar Notícia</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por título ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Categoria
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={columns}
        onEdit={(item) => handleEdit(item as News)}
        onDelete={(item) => setNewsToDelete(item as News)}
        actions={['edit', 'delete']}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNews(null);
          resetForm();
        }}
        title={editingNews ? 'Editar Notícia' : 'Adicionar Notícia'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autor
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.isPublished.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="false">Rascunho</option>
                <option value="true">Publicado</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumo
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            label="Imagem da Notícia"
            className="mb-4"
          />

          {formData.imageUrl && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingNews(null);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingNews ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!newsToDelete}
        onClose={() => setNewsToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar a notícia "${newsToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </div>
  );
}
