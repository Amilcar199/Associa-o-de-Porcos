'use client'

import { useCallback, useState } from 'react'
import { X, Send, CheckCircle2 } from 'lucide-react'
import { ANGOLA_PROVINCE_NAMES } from './angola-provinces'

interface FarmRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  isEn?: boolean
  defaultProvince?: string
  onRegistered?: () => void
}

export default function FarmRegisterModal({ isOpen, onClose, isEn = false, defaultProvince, onRegistered }: FarmRegisterModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const fd = new FormData(form)

    const body = {
      producerName: String(fd.get('producerName') || ''),
      farmName: String(fd.get('farmName') || ''),
      province: String(fd.get('province') || ''),
      municipality: String(fd.get('municipality') || ''),
      phone: String(fd.get('phone') || ''),
      email: String(fd.get('email') || ''),
      notes: String(fd.get('notes') || ''),
      herd: {
        total: Number(fd.get('total') || 0),
        females: Number(fd.get('females') || 0),
        forSlaughter: Number(fd.get('forSlaughter') || 0),
        forBreeding: Number(fd.get('forBreeding') || 0),
      },
    }

    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setSuccess(true)
        form.reset()
        onRegistered?.()
      } else {
        setError(json.error || (isEn ? 'Failed to submit, please try again.' : 'Falha ao enviar, tente novamente.'))
      }
    } catch {
      setError(isEn ? 'Network error, please try again.' : 'Erro de rede, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="farm-register-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 id="farm-register-title" className="text-lg font-heading font-bold text-gray-900">
            {isEn ? 'Register your farm' : 'Cadastrar minha fazenda'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Fechar'}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="mx-auto text-primary-600 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {isEn ? 'Registration received!' : 'Cadastro recebido!'}
              </h4>
              <p className="text-gray-600 mb-6">
                {isEn
                  ? 'Your farm will appear on the map after being reviewed and approved by our team.'
                  : 'A sua fazenda aparecerá no mapa após ser revista e aprovada pela nossa equipa.'}
              </p>
              <button type="button" onClick={onClose} className="btn-primary">
                {isEn ? 'Close' : 'Fechar'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div role="alert" aria-live="assertive" className="rounded-xl bg-red-50 p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="producerName" className="block text-sm text-gray-700 mb-1">
                    {isEn ? 'Producer name' : 'Nome do produtor'} *
                  </label>
                  <input id="producerName" name="producerName" required maxLength={120} className="input-field px-3 py-2" placeholder={isEn ? 'Full name' : 'Nome completo'} />
                </div>
                <div>
                  <label htmlFor="farmName" className="block text-sm text-gray-700 mb-1">
                    {isEn ? 'Farm name' : 'Nome da fazenda'}
                  </label>
                  <input id="farmName" name="farmName" maxLength={120} className="input-field px-3 py-2" placeholder={isEn ? 'Optional' : 'Opcional'} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="province" className="block text-sm text-gray-700 mb-1">
                    {isEn ? 'Province' : 'Província'} *
                  </label>
                  <select id="province" name="province" required defaultValue={defaultProvince || ''} className="input-field px-3 py-2">
                    <option value="" disabled>{isEn ? 'Select a province' : 'Selecione uma província'}</option>
                    {ANGOLA_PROVINCE_NAMES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="municipality" className="block text-sm text-gray-700 mb-1">
                    {isEn ? 'Municipality' : 'Município'}
                  </label>
                  <input id="municipality" name="municipality" maxLength={120} className="input-field px-3 py-2" placeholder={isEn ? 'Optional' : 'Opcional'} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">{isEn ? 'Phone' : 'Telefone'}</label>
                  <input id="phone" name="phone" maxLength={30} className="input-field px-3 py-2" placeholder="(+244) 9xx xxx xxx" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
                  <input id="email" name="email" type="email" maxLength={120} className="input-field px-3 py-2" placeholder="seu@email.com" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  {isEn ? 'Herd details' : 'Detalhes do rebanho'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor="total" className="block text-xs text-gray-600 mb-1">
                      {isEn ? 'Total pigs' : 'Total de porcos'} *
                    </label>
                    <input id="total" name="total" type="number" min={0} required className="input-field px-3 py-2" placeholder="0" />
                  </div>
                  <div>
                    <label htmlFor="females" className="block text-xs text-gray-600 mb-1">
                      {isEn ? 'Females' : 'Fêmeas'}
                    </label>
                    <input id="females" name="females" type="number" min={0} className="input-field px-3 py-2" placeholder="0" />
                  </div>
                  <div>
                    <label htmlFor="forSlaughter" className="block text-xs text-gray-600 mb-1">
                      {isEn ? 'For slaughter' : 'P/ abate'}
                    </label>
                    <input id="forSlaughter" name="forSlaughter" type="number" min={0} className="input-field px-3 py-2" placeholder="0" />
                  </div>
                  <div>
                    <label htmlFor="forBreeding" className="block text-xs text-gray-600 mb-1">
                      {isEn ? 'For breeding' : 'P/ reprodução'}
                    </label>
                    <input id="forBreeding" name="forBreeding" type="number" min={0} className="input-field px-3 py-2" placeholder="0" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm text-gray-700 mb-1">
                  {isEn ? 'Notes' : 'Observações'}
                </label>
                <textarea id="notes" name="notes" rows={3} maxLength={500} className="input-field px-3 py-2" placeholder={isEn ? 'Optional' : 'Opcional'} />
              </div>

              <p className="text-xs text-gray-500">
                {isEn
                  ? 'Your registration will be reviewed by our team before appearing on the public map.'
                  : 'O seu cadastro será revisto pela nossa equipa antes de aparecer no mapa público.'}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
                <button type="submit" disabled={loading} className="btn-primary inline-flex items-center disabled:opacity-60">
                  <Send size={18} className="mr-2" aria-hidden />
                  {loading ? (isEn ? 'Sending...' : 'Enviando...') : (isEn ? 'Submit registration' : 'Enviar cadastro')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
