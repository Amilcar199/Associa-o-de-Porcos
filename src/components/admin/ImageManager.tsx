'use client';

import { useState, useEffect } from 'react';
import { Trash2, Download, Eye, Upload } from 'lucide-react';
import ImageUpload from './ui/ImageUpload';
import ConfirmDialog from './ui/ConfirmDialog';
import Modal from './ui/Modal';
import { toast } from 'react-hot-toast';

interface Image {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}

export default function ImageManager() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'news' | 'logos' | 'collaborators'>('all')
  const [uploadCategory, setUploadCategory] = useState<'products' | 'news' | 'logos' | 'collaborators'>('products')
  const [replaceTarget, setReplaceTarget] = useState<string>('')

  // Paginação client-side
  const [page, setPage] = useState(1)
  const limit = 12
  const total = images.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const end = start + limit
  const filteredByTab = images.filter((img:any)=>{
    if (activeTab === 'all') return true
    const cat = (img as any).category || (img as any).metadata?.category || ''
    return cat === activeTab
  })
  const paginatedImages = filteredByTab.slice(start, end)

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      } else {
        toast.error('Erro ao carregar imagens')
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      toast.error('Erro ao carregar imagens')
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    toast.success('Imagem enviada com sucesso')
    // Recarregar lista de imagens após upload
    setTimeout(() => {
      fetchImages();
      setShowUploadModal(false);
      setUploadedImageUrl(null);
    }, 800);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch(`/api/images/${imageToDelete.fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter(img => img.fileId !== imageToDelete.fileId));
        toast.success('Imagem removida')
      } else {
        toast.error('Falha ao remover imagem')
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast.error('Erro ao remover imagem')
    } finally {
      setImageToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${imageUrl}`);
    toast.success('URL copiada')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {[
              {key:'all',label:'Todos'},
              {key:'products',label:'Produtos'},
              {key:'news',label:'Notícias'},
              {key:'logos',label:'Logos'},
              {key:'collaborators',label:'Colaboradores'}
            ].map(t => (
              <button
                key={t.key}
                onClick={()=>{ setActiveTab(t.key as any); setPage(1) }}
                className={`px-3 py-1 rounded ${activeTab===t.key ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload de Imagens</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={16} />
            <span>Upload de Imagem</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedImages.map((image) => (
            <div
              key={image.fileId}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="relative mb-3">
                <img
                  src={`/api/images/${image.fileId}`}
                  alt={image.filename}
                  className="w-full h-32 object-cover rounded-lg"
                />
                                 <div className="absolute top-2 right-2 flex space-x-1">
                   <button
                     onClick={() => {
                       setSelectedImage(image);
                       setShowPreviewModal(true);
                     }}
                     className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
                     title="Visualizar"
                   >
                     <Eye size={14} />
                   </button>
                   <button
                     onClick={async () => {
                       // Definir como logo do site
                       try {
                         await fetch('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ logoUrl: `/api/images/${image.fileId}` }) })
                         toast.success('Logo atualizado')
                       } catch {}
                     }}
                     className="bg-green-600 text-white p-1 rounded hover:bg-green-700 transition-colors"
                     title="Definir como logo"
                   >
                     <Upload size={14} />
                   </button>
                   <button
                     onClick={() => { setReplaceTarget(image.fileId); setShowUploadModal(true) }}
                     className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600 transition-colors"
                     title="Substituir imagem"
                   >
                     <Upload size={14} />
                   </button>
                   <button
                     onClick={() => setImageToDelete(image)}
                     className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                     title="Deletar"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.filename}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Tamanho: {formatFileSize(image.size)}</p>
                  <p>Upload: {formatDate(image.uploadedAt)}</p>
                </div>
                <button
                  onClick={() => copyImageUrl(`/api/images/${image.fileId}`)}
                  className="w-full text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  Copiar URL
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Nenhuma imagem encontrada</p>
            <p className="text-sm">Faça upload da primeira imagem para começar</p>
          </div>
        )}

        {/* Paginação */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div>
              Mostrando {Math.min((page - 1) * limit + 1, total)} a {Math.min(page * limit, total)} de {total}
            </div>
            <div className="space-x-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-2 py-1 border rounded disabled:opacity-50">Próximo</button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload de Imagem"
      >
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Categoria</label>
            <select value={uploadCategory} onChange={(e)=>setUploadCategory(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg">
              <option value="products">Produtos</option>
              <option value="news">Notícias</option>
              <option value="logos">Logos</option>
              <option value="collaborators">Colaboradores</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Substituir imagem existente (opcional)</label>
            <input value={replaceTarget} onChange={(e)=>setReplaceTarget(e.target.value)} placeholder="fileId da imagem" className="w-full px-3 py-2 border rounded-lg" />
            <p className="text-xs text-gray-500 mt-1">Dica: clique em "Substituir imagem" no card para preencher automaticamente</p>
          </div>
        </div>
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          className="mb-4"
        />
        <form
          onSubmit={async (e)=>{
            e.preventDefault()
            const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
            const file = input?.files?.[0]
            if (!file) return
            const fd = new FormData()
            fd.append('file', file)
            fd.append('category', uploadCategory)
            if (replaceTarget) fd.append('replaceId', replaceTarget)
            const res = await fetch('/api/images/upload',{ method:'POST', body: fd })
            if (res.ok){ toast.success('Upload concluído'); setReplaceTarget(''); setUploadCategory('products'); handleImageUploaded((await res.json()).data.url) } else { toast.error('Falha no upload') }
          }}
        >
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirmar envio</button>
        </form>
        {uploadedImageUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Imagem enviada com sucesso!
            </p>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Visualizar Imagem"
      >
        {selectedImage && (
          <div className="space-y-4">
            <img
              src={`/api/images/${selectedImage.fileId}`}
              alt={selectedImage.filename}
              className="w-full rounded-lg"
            />
            <div className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {selectedImage.filename}</p>
              <p><strong>Tamanho:</strong> {formatFileSize(selectedImage.size)}</p>
              <p><strong>Tipo:</strong> {selectedImage.contentType}</p>
              <p><strong>Upload:</strong> {formatDate(selectedImage.uploadedAt)}</p>
              <p><strong>URL:</strong> {`${window.location.origin}/api/images/${selectedImage.fileId}`}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDeleteImage}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar a imagem "${imageToDelete?.filename}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
