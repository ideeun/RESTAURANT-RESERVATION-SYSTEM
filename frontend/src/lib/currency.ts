/** Цены в кыргызских сомах (KGS) */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} сом`;
}
