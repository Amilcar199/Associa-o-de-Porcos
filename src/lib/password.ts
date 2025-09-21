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

export function isPasswordStrong(password: string): boolean {
  if (typeof password !== 'string') return false
  if (password.length < 6) return false
  if (!/\d/.test(password)) return false
  if (hasNumericSequence(password, 3)) return false
  return true
}

