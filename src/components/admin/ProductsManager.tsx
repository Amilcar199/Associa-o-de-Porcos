'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DataTable from './ui/DataTable';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import ImageUpload from './ui/ImageUpload';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  breed: string;
  age: number;
  weight: number;
  imageUrl?: string;
  availability?: 'available' | 'sold' | 'reserved';
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  breed: string;
  age: number;
  weight: number;
  imageUrl?: string;
  isAvailable: boolean;
  location?: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    breed: '',
    age: 0,
    weight: 0,
    imageUrl: '',
    isAvailable: true,
    location: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        breed: allowedBreeds.includes(formData.breed) ? formData.breed : 'Outro',
        age: formData.age,
        weight: formData.weight,
        imageUrl: formData.imageUrl,
        isAvailable: formData.isAvailable,
        location: formData.location
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Produto atualizado' : 'Produto criado');
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        try { const err = await response.json(); toast.error(err?.error || 'Falha ao salvar produto') } catch { toast.error('Falha ao salvar produto') }
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      breed: product.breed,
      age: product.age,
      weight: product.weight,
      imageUrl: (product as any).imageUrl || '',
      isAvailable: product.availability ? product.availability === 'available' : !!product.isAvailable,
      location: (product as any).location || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productToDelete._id));
        toast.success('Produto removido');
      } else {
        toast.error('Falha ao remover produto');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast.error('Erro ao remover produto');
    } finally {
      setProductToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      breed: '',
      age: 0,
      weight: 0,
      imageUrl: '',
      isAvailable: true,
      location: ''
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterBreed || product.breed === filterBreed;
    return matchesSearch && matchesFilter;
  });

  const breeds = Array.from(new Map(products.map((p: any) => [p.breed, p.breed])).values()).filter(Boolean);
  const allowedBreeds = [
    'Landrace','Large White','Duroc','Hampshire','Pietrain','Yorkshire','Chester White','Spotted','Tamworth','Gloucester Old Spots','Mangalitsa','Ossabaw Island Hog','Mulefoot','Caipira','Piau','Moura','Canastra','Cruzado','Outro'
  ]

  const columns = [
    { key: 'name', title: 'Nome', sortable: true },
    { key: 'breed', title: 'Raça', sortable: true },
    { key: 'age', title: 'Idade (meses)', sortable: true },
    { key: 'weight', title: 'Peso (kg)', sortable: true },
    { key: 'price', title: 'Preço (Kz)' },
    { key: 'availability', title: 'Disponibilidade' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price);
  };

  const formatAvailability = (availability: string | boolean | undefined) => {
    const status = typeof availability === 'boolean'
      ? (availability ? 'available' : 'reserved')
      : (availability || 'reserved')
    const map: Record<string, { text: string; cls: string }> = {
      available: { text: 'Disponível', cls: 'bg-green-100 text-green-800' },
      reserved: { text: 'Reservado', cls: 'bg-yellow-100 text-yellow-800' },
      sold: { text: 'Vendido', cls: 'bg-gray-100 text-gray-700' },
    }
    const conf = map[status] || map.reserved
    return (
      <span className={`${conf.cls} text-xs font-medium px-2 py-1 rounded-full`}>
        {conf.text}
      </span>
    );
  };

  // Ordenação client-side
  const [sortKey, setSortKey] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey as keyof typeof a]
    const bv = b[sortKey as keyof typeof b]
    if (av == null || bv == null) return 0
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortOrder === 'asc' ? av - bv : bv - av
    }
    const as = String(av).toLowerCase()
    const bs = String(bv).toLowerCase()
    return sortOrder === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
  })

  const tableData = sortedProducts.map(product => ({
    ...product,
    price: formatPrice(product.price),
    availability: formatAvailability(product.availability ?? (product as any).isAvailable)
  }));

  // Paginação no cliente
  const [page, setPage] = useState(1)
  const limit = 10
  const total = tableData.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = tableData.slice(start, end)
 
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
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Produtos</h2>
          <p className="text-gray-600">Gerencie os produtos disponíveis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          <span>Adicionar Produto</span>
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
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Raça
            </label>
            <select
              value={filterBreed}
              onChange={(e) => { setFilterBreed(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas as raças</option>
              {breeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={paginatedData}
        columns={columns}
        onEdit={(item) => handleEdit(item as Product)}
        onDelete={(item) => setProductToDelete(item as Product)}
        pagination={{ page, limit, total, pages }}
        onPageChange={(p) => setPage(Math.min(Math.max(1, p), pages))}
        onSort={(key, order) => { setSortKey(key); setSortOrder(order) }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
          resetForm();
        }}
        title={editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto
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
                Raça
              </label>
              <select
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {allowedBreeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idade (meses)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço (Kz)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponível
              </label>
              <select
                value={formData.isAvailable.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex.: Luanda, Angola"
              required
            />
          </div>

                     {/* Image Upload */}
           <ImageUpload
             onImageUploaded={handleImageUploaded}
             label="Imagem do Produto (upload local ou cole uma URL acima)"
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
                 setEditingProduct(null);
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
               {editingProduct ? 'Atualizar' : 'Salvar'}
             </button>
           </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
