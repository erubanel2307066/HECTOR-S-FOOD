export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10
}

export function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('52')) {
    return digits.slice(2)
  }
  if (digits.length === 13 && digits.startsWith('521')) {
    return digits.slice(3)
  }
  return digits
}

const MAX_LENGTHS: Record<string, number> = {
  customerName: 200,
  phone: 20,
  address: 500,
  schedule: 50,
  name: 200,
  description: 1000,
  message: 2000,
}

export function validateLength(field: string, value: string): string | null {
  const max = MAX_LENGTHS[field]
  if (!max) return null
  if (value.length > max) return `${field} no puede exceder ${max} caracteres`
  return null
}
