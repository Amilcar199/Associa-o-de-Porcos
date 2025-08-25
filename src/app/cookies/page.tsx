export const metadata = {
  title: 'Cookies',
  description: 'Informações sobre o uso de cookies neste site.'
}

export default function CookiesPage() {
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-4">Política de Cookies</h1>
      <div className="prose prose-green max-w-none">
        <p>Utilizamos cookies para melhorar a experiência do utilizador e analisar o tráfego.</p>
        <h2>O que são cookies</h2>
        <p>Cookies são pequenos arquivos armazenados no seu dispositivo para lembrar preferências e sessões.</p>
        <h2>Como gerir cookies</h2>
        <p>Pode gerir ou desativar cookies nas definições do seu navegador. Algumas funcionalidades podem ser afetadas.</p>
      </div>
    </section>
  )
}

