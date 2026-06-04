type Currency = 'MXN' | 'USD' | 'COP' | 'ARS' | 'CLP' | 'EUR'

export function formatCurrency(amount: number, currency: Currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
