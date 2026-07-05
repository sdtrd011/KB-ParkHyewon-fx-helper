import { CURRENCY_CONFIGS, getCurrencyConfig } from '@/shared/config'
import {
  CASH_SELL_NON_POSITIVE_APPLIED_RATE_MESSAGE,
  isPercentInRange,
  isPositiveAmount,
  PREFERENTIAL_RATE_RANGE_MESSAGE,
  percentToDecimal,
  roundToInteger,
  roundToTwoDecimals,
  SPREAD_RATE_RANGE_MESSAGE,
  wouldCashSellAppliedRateBeNonPositive,
} from '@/shared/lib'
import type {
  ExchangeCalculationInput,
  ExchangeCalculationResult,
} from './types'

const SUPPORTED_CURRENCY_CODES = new Set(CURRENCY_CONFIGS.map((currency) => currency.code))

function isInvalidNumber(value: number): boolean {
  return typeof value !== 'number' || Number.isNaN(value)
}

function validateExchangeInput(input: ExchangeCalculationInput): void {
  if (!input.currencyCode || !SUPPORTED_CURRENCY_CODES.has(input.currencyCode)) {
    throw new Error('통화를 선택해주세요.')
  }

  if (isInvalidNumber(input.baseRate)) {
    throw new Error('매매기준율을 입력해주세요.')
  }

  if (input.baseRate <= 0) {
    throw new Error('매매기준율은 0보다 커야 합니다.')
  }

  if (isInvalidNumber(input.spreadRate)) {
    throw new Error('스프레드율을 입력해주세요.')
  }

  if (!isPercentInRange(input.spreadRate)) {
    throw new Error(SPREAD_RATE_RANGE_MESSAGE)
  }

  if (isInvalidNumber(input.preferentialRate)) {
    throw new Error('우대율을 입력해주세요.')
  }

  if (!isPercentInRange(input.preferentialRate)) {
    throw new Error(PREFERENTIAL_RATE_RANGE_MESSAGE)
  }

  if (isInvalidNumber(input.foreignAmount)) {
    throw new Error('외화 금액을 입력해주세요.')
  }

  if (!isPositiveAmount(input.foreignAmount)) {
    throw new Error('외화 금액은 0보다 커야 합니다.')
  }

  if (
    input.transactionType === 'CASH_SELL' &&
    wouldCashSellAppliedRateBeNonPositive(
      input.baseRate,
      input.spreadRate,
      input.preferentialRate,
    )
  ) {
    throw new Error(CASH_SELL_NON_POSITIVE_APPLIED_RATE_MESSAGE)
  }
}

export function calculateExchange(input: ExchangeCalculationInput): ExchangeCalculationResult {
  validateExchangeInput(input)

  const spreadDecimal = percentToDecimal(input.spreadRate)
  const preferentialDecimal = percentToDecimal(input.preferentialRate)
  const spreadFactor = spreadDecimal * (1 - preferentialDecimal)

  const rawAppliedRate =
    input.transactionType === 'CASH_BUY'
      ? input.baseRate * (1 + spreadFactor)
      : input.baseRate * (1 - spreadFactor)

  const appliedRate = roundToTwoDecimals(rawAppliedRate)
  const currencyUnit = getCurrencyConfig(input.currencyCode).unit
  const krwAmount = roundToInteger((input.foreignAmount / currencyUnit) * appliedRate)

  return {
    currencyCode: input.currencyCode,
    transactionType: input.transactionType,
    appliedRate,
    krwAmount,
    currencyUnit,
  }
}
