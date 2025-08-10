'use client'

import { useState } from 'react'
import { Mail, Phone, Send } from 'lucide-react'

export default function ContatoPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const body = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      subject: String(formData.get('subject') || ''),
      message: String(formData.get('message') || ''),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSuccess('Mensagem enviada com sucesso!')
        form.reset()
      } else {
        setError(json.error || 'Falha ao enviar, tente novamente.')
      }
    } catch (err) {
      setError('Erro de rede, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container-custom py-12 grid md:grid-cols-2 gap-10">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary-800 mb-2">Contato</h1>
        <p className="text-gray-600 mb-6">Fale connosco para parcerias, dúvidas e informações.</p>
        <div className="space-y-4 text-gray-700 bg-white rounded-xl shadow p-6">
          <div className="flex items-center space-x-3"><Mail size={18} className="text-primary-600" /><span>contato@associacaodeporcos.ao</span></div>
          <div className="flex items-center space-x-3"><Phone size={18} className="text-primary-600" /><span>(+244) 222 123 456</span></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {success && <div className="p-3 bg-green-50 text-green-700 rounded">{success}</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nome</label>
            <input name="name" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Telefone</label>
            <input name="phone" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Assunto</label>
            <input name="subject" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mensagem</label>
          <textarea name="message" required rows={5} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <button disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded">
          <Send size={16} className="mr-2" /> {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </section>
  )
}