export const metadata = {
  title: 'Termos de Uso',
  description: 'Condições para utilização do site e serviços.'
}

export default function TermosPage() {
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-4">Termos de Uso</h1>
      <div className="prose prose-green max-w-none">
        <p>Ao utilizar este site, você concorda com estes termos e condições.</p>
        <h2>Uso permitido</h2>
        <p>O site deve ser usado de forma lícita, sem violar direitos de terceiros ou leis aplicáveis.</p>
        <h2>Conteúdo</h2>
        <p>Reservamo-nos o direito de alterar conteúdos, funcionalidades e políticas sem aviso prévio.</p>
        <h2>Limitação de responsabilidade</h2>
        <p>Não nos responsabilizamos por danos indiretos decorrentes do uso do site.</p>
      </div>
    </section>
  )
}

