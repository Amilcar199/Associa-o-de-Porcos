'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import DataTable from './ui/DataTable';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import ImageUpload from './ui/ImageUpload';

interface Collaborator {
  _id: string;
  name: string;
  role: string;
  company: string;
  order?: number;
  avatar?: string;
  description: string;
  contact: {
    email: string;
    phone: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CollaboratorFormData {
  name: string;
  role: string;
  company: string;
  order?: number;
  avatar?: string;
  description: string;
  contact: {
    email: string;
    phone: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isFeatured: boolean;
}

export default function CollaboratorsManager() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<Collaborator | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    role: '',
    company: '',
    order: undefined,
    avatar: '',
    description: '',
    contact: {
      email: '',
      phone: ''
    },
    socialMedia: {
      linkedin: '',
      twitter: '',
      website: ''
    },
    isFeatured: false
  });

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch('/api/collaborators');
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCollaborator ? `/api/collaborators/${editingCollaborator._id}` : '/api/collaborators';
      const method = editingCollaborator ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingCollaborator(null);
        resetForm();
        fetchCollaborators();
      } else {
        try { const err = await response.json(); alert(err?.error || 'Falha ao salvar colaborador') } catch { alert('Falha ao salvar colaborador') }
      }
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
    }
  };

  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setFormData({
      name: collaborator.name,
      role: collaborator.role,
      company: collaborator.company,
      order: collaborator.order,
      avatar: collaborator.avatar || '',
      description: collaborator.description,
      contact: collaborator.contact,
      socialMedia: collaborator.socialMedia,
      isFeatured: collaborator.isFeatured
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!collaboratorToDelete) return;

    try {
      const response = await fetch(`/api/collaborators/${collaboratorToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollaborators(collaborators.filter(c => c._id !== collaboratorToDelete._id));
      }
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
    } finally {
      setCollaboratorToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      company: '',
      avatar: '',
      description: '',
      contact: {
        email: '',
        phone: ''
      },
      socialMedia: {
        linkedin: '',
        twitter: '',
        website: ''
      },
      isFeatured: false
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
  };

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCompany || collaborator.company === filterCompany;
    return matchesSearch && matchesFilter;
  });

  const companies = Array.from(new Map(collaborators.map(c => [c.company, c.company])).values());

  const columns = [
    { key: 'order', title: 'Ordem', sortable: true, render: (value: any, row: any) => (
      <div className="flex items-center gap-2">
        <span className="inline-block w-8 text-right">{value ?? '-'}</span>
        <div className="flex flex-col">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-800 leading-none"
            title="Mover para cima"
            onClick={async () => {
              try {
                await fetch(`/api/collaborators/${row._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ order: Math.max(0, (row.order || 0) - 1) })
                })
                fetchCollaborators()
              } catch {}
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-800 leading-none"
            title="Mover para baixo"
            onClick={async () => {
              try {
                await fetch(`/api/collaborators/${row._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ order: (row.order || 0) + 1 })
                })
                fetchCollaborators()
              } catch {}
            }}
          >
            ↓
          </button>
        </div>
      </div>
    ) },
    { key: 'name', title: 'Nome', sortable: true },
    { key: 'role', title: 'Cargo', sortable: true },
    { key: 'company', title: 'Empresa', sortable: true },
    { key: 'contact', title: 'Contato' },
    { key: 'isFeatured', title: 'Destaque', sortable: true },
    { key: 'createdAt', title: 'Data', sortable: true }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatContact = (contact: { email?: string; phone?: string } | undefined) => {
    const email = contact?.email || '-'
    const phone = contact?.phone || '-'
    return (
      <div className="text-sm">
        <div>{email}</div>
        <div className="text-gray-500">{phone}</div>
      </div>
    );
  };

  const formatFeatured = (isFeatured: boolean) => {
    return isFeatured ? (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
        Destaque
      </span>
    ) : (
      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
        Normal
      </span>
    );
  };

  const tableData = filteredCollaborators
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(collaborator => ({
    ...collaborator,
    contact: formatContact(collaborator.contact),
    isFeatured: formatFeatured(collaborator.isFeatured),
    createdAt: formatDate(collaborator.createdAt)
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
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Colaboradores</h2>
          <p className="text-gray-600">Gerencie os colaboradores e parceiros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          <span>Adicionar Colaborador</span>
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
                placeholder="Buscar por nome, cargo ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Empresa
            </label>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as empresas</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={columns}
        onEdit={(item) => handleEdit(item as Collaborator)}
        onDelete={(item) => setCollaboratorToDelete(item as Collaborator)}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCollaborator(null);
          resetForm();
        }}
        title={editingCollaborator ? 'Editar Colaborador' : 'Adicionar Colaborador'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
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
                Ordem (prioridade)
              </label>
              <input
                type="number"
                min={0}
                value={formData.order ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value === '' ? undefined : Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Deixe em branco para próxima posição"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destaque
              </label>
              <select
                value={formData.isFeatured.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="false">Normal</option>
                <option value="true">Destaque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact: { ...prev.contact, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact: { ...prev.contact, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialMedia.linkedin || ''}
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
                value={formData.socialMedia.twitter || ''}
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
                Website
              </label>
              <input
                type="url"
                value={formData.socialMedia.website || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  socialMedia: { ...prev.socialMedia, website: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image Upload */}
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            label="Foto do Colaborador"
            className="mb-4"
          />

          {formData.avatar && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Foto atual:</p>
              <img
                src={formData.avatar}
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
                setEditingCollaborator(null);
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
              {editingCollaborator ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!collaboratorToDelete}
        onClose={() => setCollaboratorToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar o colaborador "${collaboratorToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
