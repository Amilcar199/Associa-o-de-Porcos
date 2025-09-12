'use client'

import React from 'react'

export default function ConstitutionDocsClient() {
  let imageUrls: string[] = []
  try {
    // Look for images specifically under assets/Conteudos Suinos/pdf_paginas_png
    // Use relative path from this file to ensure webpack resolves correctly
    const req = (require as any).context('../../components/assets', true, /Conteudos Suinos\/pdf_paginas_png\/(.*)\.(png|jpe?g|webp)$/i)
    imageUrls = req.keys().map((key: string) => req(key))
  } catch {
    imageUrls = []
  }

  if (imageUrls.length === 0) {
    return (
      <p className="text-gray-600">Nenhuma imagem encontrada em assets. Coloque-as em uma pasta chamada <code>pdf_paginas_png</code> dentro de <code>src/components/assets</code> ou na pasta pública indicada.</p>
    )
  }

  return (
    <div className="not-prose">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {imageUrls.map((src) => (
          <div key={src} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img src={src} alt="Documento de constituição" className="w-full h-full object-cover" />
            <a href={src} target="_blank" rel="noopener noreferrer" className="absolute inset-0 group">
              <span className="sr-only">Abrir documento</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

