'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // em bytes
}

export default function ImageUpload({
  onImageUploaded,
  className = '',
  label = 'Upload de Imagem',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024 // 5MB
}: ImageUploadProps) {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError(isEn ? 'Please select image files only.' : 'Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize) {
      setError(isEn ? `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` : `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload da imagem
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isEn ? 'Upload error' : 'Erro no upload'));
      }

      const result = await response.json();
      onImageUploaded(result.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? 'Image upload error' : 'Erro no upload da imagem'));
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        input.files = event.dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const clearImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isUploading
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-green-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg shadow-sm"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-green-600">{isEn ? 'Uploading...' : 'Fazendo upload...'}</span>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <p>{isEn ? 'Drag an image here or' : 'Arraste uma imagem aqui ou'}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-600 hover:text-green-500 font-medium"
                  >
                    {isEn ? 'click to select' : 'clique para selecionar'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {isEn ? 'PNG, JPG, GIF up to' : 'PNG, JPG, GIF até'} {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
