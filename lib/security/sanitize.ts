export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '')
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '').slice(0, 15)
}
