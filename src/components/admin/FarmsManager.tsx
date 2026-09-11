'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash } from 'lucide-react'
import toast from 'react-hot-toast'
import DataTable, { Column } from './ui/DataTable'
import ConfirmDialog from './ui/ConfirmDialog'

interface FarmRow {
  _id: string
  producerName: string
  farmName?: string
  province: string
  municipality?: string
  herd: { total: number; females: number; forSlaughter: number; forBreeding: number }
  status: 'pending' | 'approved' | 'rejected'
  phone?: string
  email?: string
  createdAt: string
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
}

const FarmsManager = () => {
  const [farms, setFarms] = useState<FarmRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [deleteTarget, setDeleteTarget] = useState<FarmRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchFarms = async (page = 1, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(status && { status }),
      })
      const res = await fetch(`/api/admin/farms?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFarms(data.data)
        setPagination(data.pagination)
      } else {
        toast.error('Erro ao carregar cadastros de fazendas')
      }
    } catch (error) {
      console.error('Erro ao buscar fazendas:', error)
      toast.error('Erro ao carregar cadastros de fazendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarms(1, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const updateStatus = async (farm: FarmRow, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/farms/${farm._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(status === 'approved' ? 'Cadastro aprovado! Já aparece no mapa público.' : 'Cadastro rejeitado.')
        fetchFarms(pagination.page, statusFilter)
      } else {
        toast.error(json.error || 'Erro ao atualizar cadastro')
      }
    } catch {
      toast.error('Erro de rede ao atualizar cadastro')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/farms/${deleteTarget._id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success('Cadastro removido')
        setDeleteTarget(null)
        fetchFarms(pagination.page, statusFilter)
      } else {
        toast.error(json.error || 'Erro ao remover cadastro')
      }
    } catch {
      toast.error('Erro de rede ao remover cadastro')
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns: Column[] = [
    { key: 'producerName', title: 'Produtor', render: (v, row) => (
      <div>
        <p className="font-medium text-gray-900">{v}</p>
        {row.farmName && <p className="text-xs text-gray-500">{row.farmName}</p>}
      </div>
    ) },
    { key: 'province', title: 'Província', render: (v, row) => (
      <div>
        <p>{v}</p>
        {row.municipality && <p className="text-xs text-gray-500">{row.municipality}</p>}
      </div>
    ) },
    { key: 'herd', title: 'Rebanho', render: (v: FarmRow['herd']) => (
      <div className="text-xs text-gray-700 space-y-0.5">
        <p><strong>{v.total}</strong> total</p>
        <p>{v.females} fêmeas · {v.forSlaughter} abate · {v.forBreeding} reprodução</p>
      </div>
    ) },
    { key: 'phone', title: 'Contacto', render: (v, row) => (
      <div className="text-xs text-gray-600">
        {row.phone && <p>{row.phone}</p>}
        {row.email && <p>{row.email}</p>}
        {!row.phone && !row.email && <p className="text-gray-400">—</p>}
      </div>
    ) },
    { key: 'status', title: 'Status', render: (v) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge[v]}`}>{statusLabel[v]}</span>
    ) },
    { key: 'actions', title: 'Ações', render: (_v, row: FarmRow) => (
      <div className="flex items-center gap-2">
        {row.status !== 'approved' && (
          <button title="Aprovar" onClick={() => updateStatus(row, 'approved')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
            <CheckCircle size={18} />
          </button>
        )}
        {row.status !== 'rejected' && (
          <button title="Rejeitar" onClick={() => updateStatus(row, 'rejected')} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50">
            <XCircle size={18} />
          </button>
        )}
        <button title="Remover" onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          <Trash size={18} />
        </button>
      </div>
    ) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'approved', 'rejected', ''] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s === '' ? 'Todos' : statusLabel[s]}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={farms}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchFarms(page, statusFilter)}
        emptyMessage="Nenhum cadastro de fazenda encontrado"
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remover cadastro"
        message={`Tem certeza que deseja remover o cadastro de "${deleteTarget?.producerName}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}

export default FarmsManager
