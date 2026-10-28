import { cookies } from 'next/headers'
import PageHeader from '@/components/ui/PageHeader'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Cookies' : 'Cookies',
    description: isEn ? 'Information about cookie usage on this site.' : 'Informações sobre o uso de cookies neste site.'
  }
}

export default function CookiesPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <>
      <PageHeader
        eyebrow={isEn ? 'Policies' : 'Políticas'}
        title={isEn ? 'Cookie Policy' : 'Política de Cookies'}
        description={isEn ? 'We use cookies to improve user experience and analyze traffic.' : 'Utilizamos cookies para melhorar a experiência do utilizador e analisar o tráfego.'}
      />
      <section className="container-custom py-10 md:py-12">
        <div className="prose prose-green max-w-3xl">
          <h2>{isEn ? 'What are cookies' : 'O que são cookies'}</h2>
          <p>{isEn ? 'Cookies are small files stored on your device to remember preferences and sessions.' : 'Cookies são pequenos arquivos armazenados no seu dispositivo para lembrar preferências e sessões.'}</p>
          <h2>{isEn ? 'How to manage cookies' : 'Como gerir cookies'}</h2>
          <p>{isEn ? 'You can manage or disable cookies in your browser settings. Some features may be affected.' : 'Pode gerir ou desativar cookies nas definições do seu navegador. Algumas funcionalidades podem ser afetadas.'}</p>
        </div>
      </section>
    </>
  )
}
