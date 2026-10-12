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
  category?: string;
  multiple?: boolean;
  maxCount?: number;
  currentCount?: number;
}

export default function ImageUpload({
  onImageUploaded,
  className = '',
  label = 'Upload de Imagem',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  maxSize = 5 * 1024 * 1024, // 5MB
  category,
  multiple = false,
  maxCount = 6,
  currentCount = 0,
}: ImageUploadProps) {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotsLeft = multiple ? Math.max(0, maxCount - currentCount) : 1
  const full = multiple && slotsLeft === 0
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0 || full) return

    const batch = files.slice(0, slotsLeft)
    const notices: string[] = []
    if (multiple && files.length > slotsLeft) {
      notices.push(isEn
        ? `Only ${slotsLeft} more photo${slotsLeft === 1 ? '' : 's'} can be added. The limit is ${maxCount}.`
        : `Só entram mais ${slotsLeft} foto${slotsLeft === 1 ? '' : 's'}. O limite é ${maxCount}.`)
    }

    setError(null)
    setIsUploading(true)

    try {
      for (const file of batch) {
        if (!allowedTypes.includes(file.type)) {
          notices.push(isEn ? 'Use a JPEG, PNG, GIF or WebP image.' : 'Use uma imagem JPEG, PNG, GIF ou WebP.')
          continue
        }
        if (file.size > maxSize) {
          notices.push(isEn
            ? `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`
            : `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
          continue
        }

        if (!multiple) {
          const reader = new FileReader()
          reader.onload = (e) => setPreview(e.target?.result as string)
          reader.readAsDataURL(file)
        }

        const formData = new FormData()
        formData.append('file', file)
        if (category) formData.append('category', category)

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          notices.push(errorData.error || (isEn ? 'Upload error' : 'Erro no upload'))
          if (!multiple) setPreview(null)
          continue
        }

        const result = await response.json()
        onImageUploaded(result.data.url)
      }
    } catch (err) {
      notices.push(err instanceof Error ? err.message : (isEn ? 'Image upload error' : 'Erro no upload da imagem'))
      if (!multiple) setPreview(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (notices.length > 0) setError(notices[0])
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    void uploadFiles(files)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    if (full || isUploading) return
    void uploadFiles(Array.from(event.dataTransfer.files || []))
  }

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
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || full}
        />

        {!multiple && preview ? (
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
                  {full ? (
                    <p>{isEn ? `Limit of ${maxCount} photos reached.` : `Limite de ${maxCount} fotos atingido.`}</p>
                  ) : (
                    <>
                      <p>{multiple
                        ? (isEn ? 'Drag photos here or' : 'Arraste as fotos aqui ou')
                        : (isEn ? 'Drag an image here or' : 'Arraste uma imagem aqui ou')}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-green-600 hover:text-green-500 font-medium"
                      >
                        {multiple
                          ? (isEn ? 'click to select several' : 'clique para selecionar várias')
                          : (isEn ? 'click to select' : 'clique para selecionar')}
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isEn ? 'PNG, JPG, GIF up to' : 'PNG, JPG, GIF até'} {Math.round(maxSize / 1024 / 1024)}MB
                  {multiple ? (isEn ? ` · up to ${maxCount} photos` : ` · até ${maxCount} fotos`) : ''}
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
