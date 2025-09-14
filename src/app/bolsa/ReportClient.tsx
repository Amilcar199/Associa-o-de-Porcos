"use client"

import React from 'react'

type Row = { date: string; region: string; category: string; price: number; variation: number }

export default function ReportClient({ rows, isEn }: { rows: Row[]; isEn: boolean }) {
  const chartData = React.useMemo(() => {
    const byCategory: Record<string, number> = {}
    rows.forEach(r => { byCategory[r.category] = (byCategory[r.category] || 0) + r.price })
    const entries = Object.entries(byCategory).map(([name, total]) => ({ name, total }))
    const max = Math.max(1, ...entries.map(e => e.total))
    return { entries, max }
  }, [rows])

  const exportRef = React.useRef(null as HTMLDivElement | null)

  const onExportPdf = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf') as any
      const el = exportRef.current
      if (!el) return
      const canvas = await html2canvas(el, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = pdf.getImageProperties(imgData)
      const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height)
      const w = imgProps.width * ratio
      const h = imgProps.height * ratio
      pdf.addImage(imgData, 'PNG', (pageWidth - w)/2, 10, w, h)
      pdf.save(isEn ? 'report.pdf' : 'relatorio.pdf')
    } catch {}
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{isEn ? 'Overview' : 'Visão Geral'}</h2>
        <button onClick={onExportPdf} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm">
          {isEn ? 'Download PDF' : 'Baixar PDF'}
        </button>
      </div>
      <div ref={exportRef}>
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">{isEn ? 'Total price by category' : 'Preço total por categoria'}</div>
          <div className="space-y-2">
            {chartData.entries.map((e, idx) => (
              <div key={e.name} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-700 truncate">{e.name}</div>
                <div className="flex-1 bg-gray-100 rounded h-3">
                  <div className="h-3 rounded bg-primary-500" style={{ width: `${(e.total / chartData.max) * 100}%` }} />
                </div>
                <div className="w-24 text-right text-sm text-gray-700">AOA {e.total.toLocaleString('pt-AO')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}