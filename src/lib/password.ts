export function hasNumericSequence(password: string, minRunLength: number = 3): boolean {
  let increasingRunLength = 1
  let decreasingRunLength = 1
  for (let index = 1; index < password.length; index++) {
    const prevCharCode = password.charCodeAt(index - 1)
    const currCharCode = password.charCodeAt(index)
    const prevIsDigit = prevCharCode >= 48 && prevCharCode <= 57
    const currIsDigit = currCharCode >= 48 && currCharCode <= 57
    if (prevIsDigit && currIsDigit && currCharCode - prevCharCode === 1) {
      increasingRunLength++
    } else {
      increasingRunLength = 1
    }
    if (prevIsDigit && currIsDigit && prevCharCode - currCharCode === 1) {
      decreasingRunLength++
    } else {
      decreasingRunLength = 1
    }
    if (increasingRunLength >= minRunLength || decreasingRunLength >= minRunLength) {
      return true
    }
  }
  return false
}

// Lista curta de senhas triviais/muito comuns que continuam a passar em regras
// de "1 número + 6 caracteres" (ex.: "senha1", "abcdef1"). Bloqueio adicional,
// não substitui uma verificação completa contra listas de senhas vazadas.
const COMMON_PASSWORDS = new Set([
  'senha123', 'password', 'password1', 'password123', '12345678',
  '123456789', 'qwerty123', 'abc123456', 'admin123', 'senha1234',
  'porco123', 'suinos123',
])

export function isPasswordStrong(password: string): boolean {
  if (typeof password !== 'string') return false
  if (password.length < 8) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/\d/.test(password)) return false
  if (!/[^A-Za-z0-9]/.test(password)) return false
  if (hasNumericSequence(password, 3)) return false
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return false
  return true
}

// Mensagem de erro correspondente às regras acima, para mostrar ao utilizador.
export const PASSWORD_POLICY_MESSAGE =
  'Senha fraca: mínimo 8 caracteres, com pelo menos 1 letra maiúscula, 1 minúscula, ' +
  '1 número e 1 caractere especial (ex.: !@#$%), e sem sequências numéricas (ex.: 123, 321)'

