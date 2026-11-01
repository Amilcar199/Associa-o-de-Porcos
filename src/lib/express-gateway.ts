/**
 * Único ponto que fala com o gateway Express.
 *
 * Ainda não há contrato do banco. Enquanto as credenciais não existirem,
 * ou o cliente HTTP abaixo não for preenchido, nenhuma cobrança Express
 * é criada nem confirmada.
 *
 * Variáveis, quando o banco as entregar:
 * EXPRESS_API_BASE, EXPRESS_API_KEY, EXPRESS_MERCHANT_ID, EXPRESS_WEBHOOK_SECRET
 *
 * A integração entra em dispatchExpressCharge. O webhook
 * /api/payments/express/webhook só confirma depois de verifyExpressWebhook
 * passar a validar a assinatura.
 */

export const EXPRESS_ENV_KEYS = [
  'EXPRESS_API_BASE',
  'EXPRESS_API_KEY',
  'EXPRESS_MERCHANT_ID',
  'EXPRESS_WEBHOOK_SECRET',
] as const

export type ExpressChargeRequest = {
  reference: string
  amount: number
  currency: 'AOA'
  description: string
  callbackUrl: string
}

export type ExpressChargeResult =
  | { ok: true; providerRef: string; checkoutUrl: string }
  | { ok: false; code: 'not_configured'; message: string }

export function expressReadiness() {
  const missing = EXPRESS_ENV_KEYS.filter((key) => !process.env[key]?.trim())
  if (missing.length > 0) {
    return { state: 'awaiting_credentials' as const, missing: [...missing] }
  }
  return { state: 'awaiting_client' as const, missing: [] as string[] }
}

export async function createExpressCharge(input: ExpressChargeRequest): Promise<ExpressChargeResult> {
  const readiness = expressReadiness()
  if (readiness.state === 'awaiting_credentials') {
    return {
      ok: false,
      code: 'not_configured',
      message: 'O gateway Express ainda não está ligado. Pode pagar por IBAN ou PayPay quando a associação publicar as contas.',
    }
  }
  if (!Number.isInteger(input.amount) || input.amount < 1 || input.currency !== 'AOA') {
    return { ok: false, code: 'not_configured', message: 'Cobrança Express inválida.' }
  }
  return dispatchExpressCharge(input)
}

async function dispatchExpressCharge(_input: ExpressChargeRequest): Promise<ExpressChargeResult> {
  // Ligar aqui o POST ao banco: merchant, referência, valor em AOA,
  // descrição e callbackUrl. A resposta tem de trazer providerRef e checkoutUrl.
  // Até esse contrato existir, a função não marca nenhum pagamento como pago.
  return {
    ok: false,
    code: 'not_configured',
    message: 'As credenciais do Express estão definidas, mas o cliente do gateway ainda não foi ligado.',
  }
}

export function verifyExpressWebhook(_rawBody: string, _signature: string | null) {
  if (expressReadiness().state === 'awaiting_credentials') return false
  // Validar HMAC com EXPRESS_WEBHOOK_SECRET quando o banco definir o cabeçalho.
  return false
}
