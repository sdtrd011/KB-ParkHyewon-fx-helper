import { CURRENCY_CONFIGS, DEFAULT_USD_BASE_RATE, getCurrencyConfig } from '@/shared/config'
import {
  isPercentInRange,
  isPositiveAmount,
  PREFERENTIAL_RATE_RANGE_MESSAGE,
  percentToDecimal,
  roundToInteger,
  roundToTwoDecimals,
  SPREAD_RATE_RANGE_MESSAGE,
} from '@/shared/lib'
import {
  CABLE_FEE,
  calculateRemittanceFee,
  resolveUsdEquivalentAmount,
} from './remittanceFees'
import type {
  RemittanceCalculationInput,
  RemittanceCalculationResult,
} from './types'

const SUPPORTED_CURRENCY_CODES = new Set(CURRENCY_CONFIGS.map((currency) => currency.code))

function isInvalidNumber(value: number): boolean {
  return typeof value !== 'number' || Number.isNaN(value)
}

function validateRemittanceInput(input: RemittanceCalculationInput): void {
  if (!input.currencyCode || !SUPPORTED_CURRENCY_CODES.has(input.currencyCode)) {
    throw new Error('통화를 선택해주세요.')
  }

  if (isInvalidNumber(input.foreignAmount)) {
    throw new Error('송금 외화 금액을 입력해주세요.')
  }

  if (!isPositiveAmount(input.foreignAmount)) {
    throw new Error('송금 외화 금액은 0보다 커야 합니다.')
  }

  if (isInvalidNumber(input.telegraphicSellingRate)) {
    throw new Error('전신환매도율을 입력해주세요.')
  }

  if (!isPositiveAmount(input.telegraphicSellingRate)) {
    throw new Error('전신환매도율은 0보다 커야 합니다.')
  }

  if (isInvalidNumber(input.telegraphicSpreadRate)) {
    throw new Error('전신환 스프레드율을 입력해주세요.')
  }

  if (!isPercentInRange(input.telegraphicSpreadRate)) {
    throw new Error(SPREAD_RATE_RANGE_MESSAGE)
  }

  if (isInvalidNumber(input.preferentialRate)) {
    throw new Error('우대율을 입력해주세요.')
  }

  if (!isPercentInRange(input.preferentialRate)) {
    throw new Error(PREFERENTIAL_RATE_RANGE_MESSAGE)
  }

  if (input.usdBaseRate !== undefined && !isPositiveAmount(input.usdBaseRate)) {
    throw new Error('USD 매매기준율은 0보다 커야 합니다.')
  }
}

export function calculateRemittance(
  input: RemittanceCalculationInput,
): RemittanceCalculationResult {
  validateRemittanceInput(input)

  const spreadDecimal = percentToDecimal(input.telegraphicSpreadRate)
  const preferentialDecimal = percentToDecimal(input.preferentialRate)
  const spreadFactor = spreadDecimal * (1 - preferentialDecimal)

  const rawAppliedRate = input.telegraphicSellingRate * (1 + spreadFactor)
  const appliedRate = roundToTwoDecimals(rawAppliedRate)
  const currencyUnit = getCurrencyConfig(input.currencyCode).unit
  const convertedKrwAmount = roundToInteger((input.foreignAmount / currencyUnit) * appliedRate)
  const usdBaseRate = input.usdBaseRate ?? DEFAULT_USD_BASE_RATE
  const usdBaseRateFromApi = input.usdBaseRateFromApi ?? false
  const usdEquivalentAmount = resolveUsdEquivalentAmount(convertedKrwAmount, usdBaseRate)
  const remittanceFee = calculateRemittanceFee(usdEquivalentAmount)
  const cableFee = CABLE_FEE
  const totalKrwCost = convertedKrwAmount + remittanceFee + cableFee

  return {
    currencyCode: input.currencyCode,
    appliedRate,
    convertedKrwAmount,
    usdEquivalentAmount,
    usdBaseRate,
    usdBaseRateFromApi,
    remittanceFee,
    cableFee,
    totalKrwCost,
    currencyUnit,
  }
}
