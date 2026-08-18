'use client'

import { useEffect, useState } from 'react'
import { Bell, Mail, Send, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<'push' | 'newsletter'>('push')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState({ activeCount: 0, totalReach: 0 })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/newsletter/subscribers', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          setStats({
            activeCount: json?.data?.activeCount || 0,
            totalReach: json?.data?.totalReach || 0,
          })
        }
      } catch {}
    })()
  }, [])

  const send = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Preencha título e mensagem')
      return
    }
    setSending(true)
    try {
      if (channel === 'push') {
        const res = await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, data: { url: '/' } }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json?.error || 'Falha ao enviar push')
          return
        }
        toast.success(`Push enviado: ${json.sent} sucesso, ${json.failed} falhas`)
      } else {
        const res = await fetch('/api/admin/newsletter/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: `<p>${body.replace(/\n/g, '<br/>')}</p>` }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json?.error || 'Falha ao enviar newsletter')
          return
        }
        toast.success(`Newsletter enviada para ${json?.data?.sent || 0} destinatários`)
      }
      setTitle('')
      setBody('')
    } catch {
      toast.error('Erro de rede')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Notificações</h1>
        <p className="text-sm text-gray-500 mt-1">Envie avisos push ou newsletter para a comunidade.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Assinantes ativos</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.activeCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Alcance total (email)</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalReach}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setChannel('push')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${channel === 'push' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
          >
            <span className="inline-flex items-center gap-2"><Bell size={16} /> Web Push</span>
          </button>
          <button
            onClick={() => setChannel('newsletter')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${channel === 'newsletter' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}
          >
            <span className="inline-flex items-center gap-2"><Mail size={16} /> Newsletter</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            placeholder={channel === 'push' ? 'Ex: Nova cotação na bolsa' : 'Ex: Newsletter de agosto'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Escreva a mensagem..."
          />
        </div>
        <button
          onClick={send}
          disabled={sending}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg"
        >
          <Send size={16} />
          {sending ? 'Enviando...' : channel === 'push' ? 'Enviar push' : 'Enviar newsletter'}
        </button>
      </div>
    </div>
  )
}
