import { percentToDecimal } from './number'

export const PREFERENTIAL_RATE_RANGE_MESSAGE =
  '우대율은 0% 이상 100% 이하로 입력해주세요.'

export const SPREAD_RATE_RANGE_MESSAGE = '스프레드율은 0% 이상 100% 이하로 입력해주세요.'

export const CASH_SELL_NON_POSITIVE_APPLIED_RATE_MESSAGE =
  '현찰 팔 때 적용환율이 0 이하가 되어 계산할 수 없습니다.'

export function isPercentInRange(value: number): boolean {
  return value >= 0 && value <= 100
}

export function isPositiveAmount(value: number): boolean {
  return value > 0
}

export function wouldCashSellAppliedRateBeNonPositive(
  baseRate: number,
  spreadRate: number,
  preferentialRate: number,
): boolean {
  const spreadDecimal = percentToDecimal(spreadRate)
  const preferentialDecimal = percentToDecimal(preferentialRate)
  const spreadFactor = spreadDecimal * (1 - preferentialDecimal)
  const rawAppliedRate = baseRate * (1 - spreadFactor)

  return rawAppliedRate <= 0
}
