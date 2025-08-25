export const metadata = {
  title: 'Política de Privacidade',
  description: 'Como coletamos, usamos e protegemos os seus dados.'
}

export default function PrivacidadePage() {
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-4">Política de Privacidade</h1>
      <div className="prose prose-green max-w-none">
        <p>Esta política descreve como tratamos os seus dados pessoais quando utiliza os nossos serviços.</p>
        <h2>Dados que coletamos</h2>
        <p>Coletamos dados fornecidos por si (por exemplo, em formulários) e dados técnicos mínimos para operação do site.</p>
        <h2>Uso dos dados</h2>
        <p>Usamos os dados para responder aos seus contactos, melhorar serviços e cumprir obrigações legais.</p>
        <h2>Armazenamento e segurança</h2>
        <p>Aplicamos medidas técnicas e organizacionais razoáveis para proteger os seus dados.</p>
        <h2>Seus direitos</h2>
        <p>Você pode solicitar acesso, correção ou eliminação dos seus dados. Contacte-nos em contato@associacaodeporcos.ao.</p>
      </div>
    </section>
  )
}

