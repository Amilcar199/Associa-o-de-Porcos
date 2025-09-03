import { cookies, headers } from 'next/headers'

export function generateMetadata() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  return {
    title: isEn ? 'Privacy Policy' : 'Política de Privacidade',
    description: isEn ? 'How we collect, use and protect your data.' : 'Como coletamos, usamos e protegemos os seus dados.'
  }
}

async function getSiteConfig() {
  try {
    const h = headers()
    const protocol = h.get('x-forwarded-proto') || 'http'
    const host = h.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const cfgRes = await fetch(`${baseUrl}/api/admin/config`, { cache: 'no-store' })
    const cfgJson = cfgRes.ok ? await cfgRes.json() : { data: {} }
    return cfgJson?.data || {}
  } catch {
    return {}
  }
}

export default async function PrivacidadePage() {
  const locale = cookies().get('locale')?.value || 'pt-AO'
  const isEn = String(locale).startsWith('en')
  const siteConfig: any = await getSiteConfig()
  return (
    <section className="container-custom section-padding">
      <h1 className="text-3xl font-heading font-bold text-primary-800 mb-4">{isEn ? 'Privacy Policy' : 'Política de Privacidade'}</h1>
      <div className="prose prose-green max-w-none">
        <p>{isEn ? 'This policy describes how we handle your personal data when you use our services.' : 'Esta política descreve como tratamos os seus dados pessoais quando utiliza os nossos serviços.'}</p>
        <h2>{isEn ? 'Data we collect' : 'Dados que coletamos'}</h2>
        <p>{isEn ? 'We collect data provided by you (e.g., in forms) and minimal technical data to operate the site.' : 'Coletamos dados fornecidos por si (por exemplo, em formulários) e dados técnicos mínimos para operação do site.'}</p>
        <h2>{isEn ? 'Use of data' : 'Uso dos dados'}</h2>
        <p>{isEn ? 'We use the data to reply to your contacts, improve services and comply with legal obligations.' : 'Usamos os dados para responder aos seus contactos, melhorar serviços e cumprir obrigações legais.'}</p>
        <h2>{isEn ? 'Storage and security' : 'Armazenamento e segurança'}</h2>
        <p>{isEn ? 'We apply reasonable technical and organizational measures to protect your data.' : 'Aplicamos medidas técnicas e organizacionais razoáveis para proteger os seus dados.'}</p>
        <h2>{isEn ? 'Your rights' : 'Seus direitos'}</h2>
        <p>{isEn ? `You can request access, correction or deletion of your data. Contact us at ${siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}.` : `Você pode solicitar acesso, correção ou eliminação dos seus dados. Contacte-nos em ${siteConfig?.contactEmail || 'contato@associacaodeporcos.ao'}.`}</p>
      </div>
    </section>
  )
}

