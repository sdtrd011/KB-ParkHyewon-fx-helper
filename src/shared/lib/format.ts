export function formatKrw(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

export function formatRate(rate: number): string {
  return rate.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPercent(percent: number): string {
  return `${percent}%`
}

export function formatForeignAmount(amount: number, currencyCode: string): string {
  return `${amount.toLocaleString('ko-KR')} ${currencyCode}`
}
