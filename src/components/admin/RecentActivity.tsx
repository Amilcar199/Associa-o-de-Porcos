'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  User,
  ShoppingCart,
  Newspaper,
  MessageSquare,
  PiggyBank,
  Plus,
  Edit,
  Trash,
  ArrowUpRight,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import Modal from './ui/Modal'

interface ActivityItem {
  type: 'user' | 'product' | 'news' | 'contact' | 'member-content' | 'farm'
  action: string
  date: Date
  user?: string
  details: string
}

const ICONS: Record<string, any> = {
  user: User,
  product: ShoppingCart,
  news: Newspaper,
  contact: MessageSquare,
  'member-content': Newspaper,
  farm: PiggyBank,
}

const COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  user: { ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-600' },
  product: { ring: 'ring-green-100', bg: 'bg-green-50', text: 'text-green-600' },
  news: { ring: 'ring-purple-100', bg: 'bg-purple-50', text: 'text-purple-600' },
  contact: { ring: 'ring-orange-100', bg: 'bg-orange-50', text: 'text-orange-600' },
  'member-content': { ring: 'ring-indigo-100', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  farm: { ring: 'ring-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  default: { ring: 'ring-gray-100', bg: 'bg-gray-50', text: 'text-gray-500' },
}

const COMPACT_LIMIT = 6
const MODAL_PAGE_SIZE = 15

function getActivityIcon(type: string, action: string) {
  if (action.includes('cadastrado') || action.includes('criado') || action.includes('publicada')) return Plus
  if (action.includes('atualizado') || action.includes('editado') || action.includes('aprovada')) return Edit
  if (action.includes('removido') || action.includes('deletado')) return Trash
  return ICONS[type] || Clock
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h atrás`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d atrás`

  return new Date(date).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit' })
}

function ActivityRow({ activity, index }: { activity: ActivityItem; index: number }) {
  const Icon = getActivityIcon(activity.type, activity.action)
  const colors = COLORS[activity.type] || COLORS.default
  return (
    <div key={index} className="flex items-start gap-3 py-3 first:pt-0">
      <div className={`h-9 w-9 shrink-0 rounded-full ${colors.bg} ring-4 ${colors.ring} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold text-gray-900">{activity.user || 'Sistema'}</span>{' '}
          <span className="text-gray-500">{activity.action.toLowerCase()}</span>
        </p>
        <p className="text-sm text-gray-500 truncate">{activity.details}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <Clock size={11} /> {formatTimeAgo(activity.date)}
        </div>
      </div>
    </div>
  )
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const [openAll, setOpenAll] = useState(false)
  const [modalItems, setModalItems] = useState<ActivityItem[]>([])
  const [modalPage, setModalPage] = useState(1)
  const [modalHasMore, setModalHasMore] = useState(false)
  const [modalTotal, setModalTotal] = useState(0)
  const [modalLoading, setModalLoading] = useState(false)

  // Card compacto: apenas os itens mais recentes, sem scroll interno infinito
  const fetchCompact = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/activity?page=1&limit=${COMPACT_LIMIT}`)
      if (res.ok) {
        const json = await res.json()
        setActivities(json.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompact()
  }, [fetchCompact])

  // Modal "Ver tudo": paginação real com "Carregar mais" (feed é finito e delimitado no backend)
  const loadModalPage = useCallback(async (page: number) => {
    setModalLoading(true)
    try {
      const res = await fetch(`/api/admin/activity?page=${page}&limit=${MODAL_PAGE_SIZE}`)
      if (res.ok) {
        const json = await res.json()
        setModalItems((prev) => (page === 1 ? json.data : [...prev, ...json.data]))
        setModalPage(json.pagination?.page || page)
        setModalHasMore(!!json.pagination?.hasMore)
        setModalTotal(json.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Erro ao buscar atividade (página):', error)
    } finally {
      setModalLoading(false)
    }
  }, [])

  const openModal = () => {
    setOpenAll(true)
    setModalItems([])
    loadModalPage(1)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
        <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse w-1/2"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary-600" />
          Atividade Recente
        </h3>
        {activities.length > 0 && (
          <button
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            onClick={openModal}
          >
            Ver tudo <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* Lista curta e fixa: só os últimos itens, sem scroll interno */}
      <div className="flex-1 divide-y divide-gray-50">
        {activities.length > 0 ? (
          activities.map((activity, index) => <ActivityRow key={index} activity={activity} index={index} />)
        ) : (
          <div className="text-center py-10">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma atividade recente</p>
          </div>
        )}
      </div>

      {openAll && (
        <Modal isOpen={openAll} onClose={() => setOpenAll(false)} title="Atividade Recente">
          <div className="space-y-1 divide-y divide-gray-50 max-h-[60vh] overflow-y-auto pr-1">
            {modalItems.map((activity, index) => <ActivityRow key={index} activity={activity} index={index} />)}
            {modalLoading && (
              <div className="flex items-center justify-center py-6 text-gray-400 text-sm gap-2">
                <Loader2 size={16} className="animate-spin" /> Carregando...
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col items-center gap-2">
            {modalHasMore ? (
              <button
                onClick={() => loadModalPage(modalPage + 1)}
                disabled={modalLoading}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {modalLoading ? 'Carregando...' : 'Carregar mais'}
              </button>
            ) : modalItems.length > 0 ? (
              <p className="inline-flex items-center gap-1.5 text-xs text-gray-400 py-1">
                <CheckCircle2 size={14} /> Fim do histórico · {modalTotal} evento{modalTotal === 1 ? '' : 's'} no total
              </p>
            ) : null}
          </div>
        </Modal>
      )}
    </motion.div>
  )
}

export default RecentActivity
