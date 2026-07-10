export function formatPrice(amount: string, currency: string): string {
  const value = Number(amount)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}
