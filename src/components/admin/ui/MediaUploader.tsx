'use client'

import { useRef, useState } from 'react'
import { Upload, X, Link2 } from 'lucide-react'

interface MediaUploaderProps {
  label?: string
  accept: string
  maxSizeBytes: number
  multiple?: boolean
  uploadEndpoint: '/api/images/upload' | '/api/videos/upload'
  values: string[]
  onChange: (urls: string[]) => void
}

export default function MediaUploader({ label = 'Uploads', accept, maxSizeBytes, multiple = true, uploadEndpoint, values, onChange }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setIsUploading(true)
    try {
      const uploads: string[] = []
      for (const file of Array.from(files)) {
        if (file.size > maxSizeBytes) {
          setError(`Arquivo muito grande: ${file.name}`)
          continue
        }
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(uploadEndpoint, { method: 'POST', body: fd, credentials: 'include' })
        if (!res.ok) {
          try { const j = await res.json(); setError(j?.error || `Falha no upload: ${file.name}`) } catch { setError(`Falha no upload: ${file.name}`) }
          continue
        }
        const j = await res.json()
        if (j?.data?.url) uploads.push(j.data.url)
      }
      if (uploads.length) {
        const next = Array.from(new Set([...(values || []), ...uploads]))
        onChange(next)
      }
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const removeItem = (idx: number) => {
    const next = (values || []).slice()
    next.splice(idx, 1)
    onChange(next)
  }

  const addUrl = () => {
    const val = urlInput.trim()
    if (!val) return
    const next = Array.from(new Set([...(values || []), val]))
    onChange(next)
    setUrlInput('')
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div onDrop={handleDrop} onDragOver={handleDragOver} className={`relative border-2 border-dashed rounded-lg p-6 text-center ${isUploading ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e)=>handleFiles(e.target.files)} disabled={isUploading} />
        {isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-green-600">Fazendo upload...</span>
          </div>
        ) : (
          <button type="button" onClick={()=>inputRef.current?.click()} className="inline-flex items-center gap-2 text-green-700 hover:text-green-800">
            <Upload className="w-4 h-4" /> Selecionar arquivos
          </button>
        )}
        <p className="text-xs text-gray-500 mt-2">Tamanho máx.: {Math.round(maxSizeBytes/1024/1024)}MB</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input value={urlInput} onChange={(e)=>setUrlInput(e.target.value)} placeholder="https://... (opcional)" className="w-full px-3 py-2 border rounded-lg" />
          <Link2 className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
        </div>
        <button type="button" onClick={addUrl} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Adicionar URL</button>
      </div>

      {(values||[]).length>0 && (
        <div className="grid grid-cols-3 gap-2">
          {(values||[]).map((url, idx) => (
            <div key={idx} className="relative group">
              {accept.startsWith('image') ? (
                <img src={url} className="w-full h-20 object-cover rounded" />
              ) : (
                <div className="aspect-video bg-black/5 rounded flex items-center justify-center text-xs text-gray-600">vídeo {idx+1}</div>
              )}
              <button type="button" onClick={()=>removeItem(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {error && (<p className="text-sm text-red-600">{error}</p>)}
    </div>
  )
}

