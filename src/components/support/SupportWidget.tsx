'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, X } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useSiteConfig } from '@/hooks/useSiteConfig'

type Role = 'bot' | 'user'

interface ChatMessage {
  id: number
  role: Role
  text: string
}

export default function SupportWidget() {
  const { locale } = useLanguage()
  const isEn = String(locale).startsWith('en')
  const { config } = useSiteConfig()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const whatsapp = useMemo(() => {
    const raw = String(config.whatsappNumber || '244923221950').replace(/\D/g, '')
    const text = encodeURIComponent(isEn
      ? 'Hello, I would like to talk to the association.'
      : 'Olá, quero falar com a associação.')
    return `https://wa.me/${raw}?text=${text}`
  }, [config.whatsappNumber, isEn])

  const answer = (question: string) => {
    const text = question.toLowerCase()
    if (/(bolsa|preço|preco|price|valoriz|invest)/.test(text)) {
      return isEn
        ? 'The pig market shows the reference price and whether it is rising. Open the market to see the average, then look at the animals for sale beside it.'
        : 'A bolsa mostra o preço de referência e se está a valorizar. Abra a bolsa para ver a média e, ao lado, os animais que pode comprar.'
    }
    if (/(compr|produto|onde|buy|price)/.test(text)) {
      return isEn
        ? 'The animals for sale are in Products, with price, origin and a way to reach the seller.'
        : 'Os animais à venda estão em Produtos, com preço, origem e forma de falar com quem anuncia.'
    }
    if (/(associ|cadastr|regist|join|membro)/.test(text)) {
      return isEn
        ? 'To become a member, use “Become a member” at the top of the page. It opens the registration.'
        : 'Para se tornar associado, use o botão “Tornar-se associado” no topo da página. Abre o cadastro.'
    }
    if (/(quem|sobre|what|associa)/.test(text)) {
      return isEn
        ? 'We are the Pig Farmers Association of the North. We connect producers, share knowledge and run the pig market.'
        : 'Somos a Associação de Suinocultores do Norte. Ligamos produtores, partilhamos conhecimento e mantemos a bolsa de suínos.'
    }
    if (/(contact|whats|suport|ajuda|falar)/.test(text)) {
      return isEn
        ? 'You can write here for a quick answer, or continue on WhatsApp with the team.'
        : 'Pode perguntar aqui para uma resposta rápida, ou continuar no WhatsApp com a equipa.'
    }
    return isEn
      ? 'I can help with who we are, the market, where to buy, or how to join. For anything else, WhatsApp reaches the team.'
      : 'Posso ajudar com quem somos, a bolsa, onde comprar ou como se associar. Para o resto, o WhatsApp fala com a equipa.'
  }

  const ask = (question: string) => {
    const clean = question.trim()
    if (!clean) return
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text: clean },
      { id: Date.now() + 1, role: 'bot', text: answer(clean) },
    ])
    setDraft('')
  }

  const chips = isEn
    ? ['Who are you?', 'Is the market up?', 'Where do I buy?', 'Become a member']
    : ['Quem são?', 'A bolsa subiu?', 'Onde compro?', 'Tornar-me associado']

  return (
    <div className="fixed bottom-5 right-4 z-[80] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-primary-800 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">{isEn ? 'Support' : 'Apoio'}</p>
              <p className="text-xs text-primary-100">{isEn ? 'Quick answers, or WhatsApp' : 'Respostas rápidas, ou WhatsApp'}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/10" aria-label={isEn ? 'Close support' : 'Fechar apoio'}>
              <X size={16} />
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
            <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {isEn
                ? 'Ask about the association, the market or where to buy.'
                : 'Pergunte sobre a associação, a bolsa ou onde comprar.'}
            </p>
            {messages.map((message) => (
              <p
                key={message.id}
                className={message.role === 'user'
                  ? 'ml-8 rounded-xl bg-primary-600 px-3 py-2 text-sm text-white'
                  : 'mr-6 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800'}
              >
                {message.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {chips.map((chip) => (
                <button key={chip} type="button" onClick={() => ask(chip)} className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:border-primary-300 hover:text-primary-800">
                  {chip}
                </button>
              ))}
            </div>
          </div>
          <form
            className="flex gap-2 border-t border-gray-100 p-3"
            onSubmit={(event) => {
              event.preventDefault()
              ask(draft)
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={isEn ? 'Write a question' : 'Escreva a pergunta'}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
            <button type="submit" className="rounded-lg bg-primary-700 px-3 py-2 text-sm font-semibold text-white">
              {isEn ? 'Send' : 'Enviar'}
            </button>
          </form>
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
            <Link href="/contato" className="text-xs font-medium text-gray-600 hover:text-primary-700">
              {isEn ? 'Contact form' : 'Formulário'}
            </Link>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              WhatsApp
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-800"
      >
        <MessageCircle size={18} />
        {isEn ? 'Support' : 'Apoio'}
      </button>
    </div>
  )
}
