import type { RemittanceCurrencyCode } from './types'

export const CABLE_FEE = 8_000

export function calculateRemittanceFee(usdEquivalentAmount: number): number {
  if (usdEquivalentAmount <= 500) {
    return 5_000
  }

  if (usdEquivalentAmount <= 2_000) {
    return 10_000
  }

  if (usdEquivalentAmount <= 5_000) {
    return 15_000
  }

  if (usdEquivalentAmount <= 10_000) {
    return 20_000
  }

  return 25_000
}

export function validateRemittanceFeeAmount(fee: number): void {
  if (fee < 0) {
    throw new Error('송금수수료는 0원 이상이어야 합니다.')
  }
}

export function validateCableFeeAmount(fee: number): void {
  if (fee < 0) {
    throw new Error('전신료는 0원 이상이어야 합니다.')
  }
}

export function resolveUsdEquivalentAmount(
  currencyCode: RemittanceCurrencyCode,
  foreignAmount: number,
): number {
  if (currencyCode === 'USD') {
    return foreignAmount
  }

  return foreignAmount
}
