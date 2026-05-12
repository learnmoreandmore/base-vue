/** 金额展示（与账务精度要求对齐时可在调用处传 fractionDigits） */
export function formatCurrency(
  amount: number,
  options?: { currency?: string; fractionDigits?: number; locale?: string },
): string {
  const { currency = 'CNY', fractionDigits = 0, locale = 'zh-CN' } = options ?? {}
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}
