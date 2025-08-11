'use client'

import { useState } from 'react'
import { Mail, Phone, Send, MessageSquare, MapPin, Clock } from 'lucide-react'

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
    <section className="">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">Contato</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">Fale connosco para parcerias, dúvidas e informações. Responderemos o mais breve possível.</p>
        </div>
      </div>

      <div className="container-custom py-10 grid lg:grid-cols-3 gap-8">
        {/* Painel de informações */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Canais de Atendimento</h2>
            <div className="space-y-3 text-gray-700">
              <a href="mailto:contato@associacaodeporcos.ao" className="flex items-center gap-3 hover:text-primary-700">
                <Mail size={18} className="text-primary-600" /> contato@associacaodeporcos.ao
              </a>
              <a href="tel:+244928476427" className="flex items-center gap-3 hover:text-primary-700">
                <Phone size={18} className="text-primary-600" /> +244 928 476 427
              </a>
              <a href="https://wa.me/244928476427" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary-700">
                <MessageSquare size={18} className="text-primary-600" /> WhatsApp
              </a>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} className="text-primary-600" /> Seg–Sex: 9h às 18h
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-primary-600" /> Luanda, Angola
              </div>
            </div>

            <a
              href="https://wa.me/244928476427"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <MessageSquare size={18} className="mr-2" /> Falar no WhatsApp
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-2">Dica</h3>
            <p className="text-sm text-gray-600">Quanto mais detalhes você enviar (quantidade, raça, peso estimado, localização), mais rápido conseguimos responder.</p>
          </div>
        </aside>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {success && <div className="p-3 bg-green-50 text-green-700 rounded">{success}</div>}
          {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nome</label>
              <input name="name" placeholder="Seu nome completo" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input name="email" type="email" placeholder="seu@email.com" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Telefone</label>
              <input name="phone" placeholder="(+244) 9xx xxx xxx" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Assunto</label>
              <input name="subject" placeholder="Ex.: Orçamento, Parceria" required className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Mensagem</label>
            <textarea name="message" required rows={6} placeholder="Descreva sua necessidade com detalhes" className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p className="mt-2 text-xs text-gray-500">Protegemos seus dados. Usaremos suas informações apenas para retornar o contato.</p>
          </div>

          <div className="flex items-center gap-3">
            <button disabled={loading} className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded font-medium disabled:opacity-60">
              <Send size={16} className="mr-2" /> {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
            <a href="tel:+244928476427" className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium">Ou ligue agora</a>
          </div>
        </form>
      </div>
    </section>
  )
}