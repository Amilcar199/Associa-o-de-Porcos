'use client'

import { useEffect, useState } from 'react'
import { Mail, Phone, MessageCircle, Clock, MapPin, Send, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

export default function ContatoPage() {
  const { locale } = useLanguage()
  const isEn = locale.startsWith('en')
  type SiteConfig = { contactEmail?: string } | null
  const [siteConfig, setSiteConfig] = useState(null as SiteConfig)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null as string | null)
  const [error, setError] = useState(null as string | null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const subject = params?.get('subject') || null
    const message = params?.get('message') || null
    if (subject || message) {
      if (subject) setSubject(subject)
      if (message) setMessage(message)
    }
  }, [])

  useEffect(()=>{
    (async()=>{ try { const r = await fetch('/api/config', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); setSiteConfig(j?.data || null) } } catch {} })()
  },[])

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
        setSuccess(isEn ? 'Message sent successfully!' : 'Mensagem enviada com sucesso!')
        form.reset()
        setSubject('')
        setMessage('')
      } else {
        setError(json.error || (isEn ? 'Failed to send, please try again.' : 'Falha ao enviar, tente novamente.'))
      }
    } catch (err) {
      setError(isEn ? 'Network error, please try again.' : 'Erro de rede, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="container-custom py-10">
          <h1 className="text-3xl font-heading font-bold text-primary-800">{isEn ? 'Contact' : 'Contacto'}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{isEn ? 'Contact us for partnerships, questions and information. We will respond as soon as possible.' : 'Fale connosco para parcerias, dúvidas e informações. Responderemos o mais breve possível.'}</p>
        </div>
      </div>

      <div className="container-custom py-10 grid lg:grid-cols-3 gap-8">
        {/* Painel de informações */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEn ? 'Contact Channels' : 'Canais de Atendimento'}</h2>
            <div className="space-y-3 text-gray-700">
              <a href={`mailto:${siteConfig?.contactEmail || 'Paulobaptista18@hotmail.com'}`} className="flex items-center gap-3 hover:text-primary-700">
                <Mail size={18} className="text-primary-600" aria-hidden /> {siteConfig?.contactEmail || 'Paulobaptista18@hotmail.com'}
              </a>
              <a href={`tel:${(siteConfig as any)?.contactPhone || '+244923221950'}`} className="flex items-center gap-3 hover:text-primary-700">
                <Phone size={18} className="text-primary-600" aria-hidden /> {(siteConfig as any)?.contactPhone || '+244 923 221 950'}
              </a>
              <a href={`https://wa.me/${(siteConfig as any)?.whatsappNumber || '244923221950'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary-700">
                <MessageCircle size={18} className="text-primary-600" aria-hidden /> WhatsApp
              </a>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock size={18} className="text-primary-600" aria-hidden /> {isEn ? 'Mon–Fri: 9am to 6pm' : 'Seg–Sex: 9h às 18h'}
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-primary-600 mt-0.5" aria-hidden />
                <div>
                  <p>Rua Manuel Caldeira nº 6, Luanda</p>
                  <p className="text-xs text-gray-500">Plus Code: 56QG+92 Luanda</p>
                  <a href="https://maps.app.goo.gl/PUczChGSKeG7QjVU9" target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 transition-colors">
                    {isEn ? 'View on Google Maps' : 'Ver no Google Maps'}
                  </a>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${(siteConfig as any)?.whatsappNumber || '244923221950'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              <MessageCircle size={18} className="mr-2" aria-hidden /> {isEn ? 'Talk on WhatsApp' : 'Falar no WhatsApp'}
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-2">{isEn ? 'Tip' : 'Dica'}</h3>
            <p className="text-sm text-gray-600">{isEn ? 'The more details you send (quantity, breed, estimated weight, location), the faster we can respond.' : 'Quanto mais detalhes você enviar (quantidade, raça, peso estimado, localização), mais rápido conseguimos responder.'}</p>
          </div>
        </aside>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {success && <div role="status" aria-live="polite" className="rounded-xl bg-green-50 p-3 text-green-700">{success}</div>}
          {error && <div role="alert" aria-live="assertive" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm text-gray-700 mb-1">{isEn ? 'Name' : 'Nome'}</label>
              <input id="contact-name" name="name" autoComplete="name" placeholder={isEn ? 'Your full name' : 'Seu nome completo'} required className="input-field px-3 py-2" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm text-gray-700 mb-1">Email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" placeholder={isEn ? 'your@email.com' : 'seu@email.com'} required className="input-field px-3 py-2" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-phone" className="block text-sm text-gray-700 mb-1">{isEn ? 'Phone' : 'Telefone'}</label>
              <input id="contact-phone" name="phone" autoComplete="tel" placeholder="(+244) 9xx xxx xxx" className="input-field px-3 py-2" />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm text-gray-700 mb-1">{isEn ? 'Subject' : 'Assunto'}</label>
              <input id="contact-subject" name="subject" value={subject} onChange={event => setSubject(event.target.value)} placeholder={isEn ? 'Ex.: Budget, Partnership' : 'Ex.: Orçamento, Parceria'} required className="input-field px-3 py-2" />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm text-gray-700 mb-1">{isEn ? 'Message' : 'Mensagem'}</label>
            <textarea id="contact-message" name="message" value={message} onChange={event => setMessage(event.target.value)} required rows={6} placeholder={isEn ? 'Describe your need in detail' : 'Descreva sua necessidade com detalhes'} className="input-field px-3 py-2" />
            <p className="mt-2 text-xs text-gray-500">{isEn ? 'We protect your data. We will use your information only to return the contact.' : 'Protegemos seus dados. Usaremos suas informações apenas para retornar o contato.'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="btn-primary inline-flex items-center disabled:opacity-60">
              <Send size={18} className="mr-2" aria-hidden /> {loading ? (isEn ? 'Sending...' : 'Enviando...') : (isEn ? 'Send Message' : 'Enviar Mensagem')}
            </button>
            <a href={`tel:${(siteConfig as any)?.contactPhone || '+244923221950'}`} className="inline-flex items-center text-primary-700 hover:text-primary-800 font-medium">{isEn ? 'Or call now' : 'Ou ligue agora'}</a>
          </div>
        </form>
      </div>
    </section>
  )
}