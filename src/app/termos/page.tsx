import { cookies } from 'next/headers'
import PageHeader from '@/components/ui/PageHeader'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Terms of Use' : 'Termos de Uso',
    description: isEn ? 'Conditions for using the site and services.' : 'Condições para utilização do site e serviços.'
  }
}

export default function TermosPage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return (
    <>
      <PageHeader
        eyebrow={isEn ? 'Policies' : 'Políticas'}
        title={isEn ? 'Terms of Use' : 'Termos de Uso'}
        description={isEn ? 'By using this site, you agree to these terms and conditions.' : 'Ao utilizar este site, você concorda com estes termos e condições.'}
      />
      <section className="container-custom py-10 md:py-12">
        <div className="prose prose-green max-w-3xl">
          <h2>{isEn ? 'Permitted use' : 'Uso permitido'}</h2>
          <p>{isEn ? 'The site must be used lawfully, without violating third-party rights or applicable laws.' : 'O site deve ser usado de forma lícita, sem violar direitos de terceiros ou leis aplicáveis.'}</p>
          <h2>{isEn ? 'Content' : 'Conteúdo'}</h2>
          <p>{isEn ? 'We reserve the right to change content, features and policies without prior notice.' : 'Reservamo-nos o direito de alterar conteúdos, funcionalidades e políticas sem aviso prévio.'}</p>
          <h2>{isEn ? 'Limitation of liability' : 'Limitação de responsabilidade'}</h2>
          <p>{isEn ? 'We are not responsible for indirect damages resulting from the use of the site.' : 'Não nos responsabilizamos por danos indiretos decorrentes do uso do site.'}</p>
        </div>
      </section>
    </>
  )
}
