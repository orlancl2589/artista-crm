export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('52') && digits.length === 12) return `+${digits}`
  if (digits.length === 10) return `+52${digits}`
  return `+${digits}`
}

export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized.startsWith('+52') && normalized.length === 13) {
    const local = normalized.slice(3)
    return `+52 ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`
  }
  return normalized
}
