'use client';

import { useState, useEffect } from 'react';
import { Trash2, Download, Eye, Upload } from 'lucide-react';
import ImageUpload from './ui/ImageUpload';
import ConfirmDialog from './ui/ConfirmDialog';
import Modal from './ui/Modal';

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

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    // Recarregar lista de imagens após upload
    setTimeout(() => {
      fetchImages();
      setShowUploadModal(false);
      setUploadedImageUrl(null);
    }, 1000);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch(`/api/images/${imageToDelete.fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter(img => img.fileId !== imageToDelete.fileId));
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
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
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${imageUrl}`);
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
          {images.map((image) => (
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
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload de Imagem"
      >
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          className="mb-4"
        />
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
