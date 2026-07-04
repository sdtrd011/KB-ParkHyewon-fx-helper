import { CURRENCY_CONFIGS, getCurrencyConfig } from '@/shared/config'
import { percentToDecimal, roundToInteger, roundToTwoDecimals } from '@/shared/lib'
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

  if (input.foreignAmount <= 0) {
    throw new Error('송금 외화 금액은 0보다 커야 합니다.')
  }

  if (isInvalidNumber(input.telegraphicSellingRate)) {
    throw new Error('전신환매도율을 입력해주세요.')
  }

  if (input.telegraphicSellingRate <= 0) {
    throw new Error('전신환매도율은 0보다 커야 합니다.')
  }

  if (isInvalidNumber(input.telegraphicSpreadRate)) {
    throw new Error('전신환 스프레드율을 입력해주세요.')
  }

  if (input.telegraphicSpreadRate < 0) {
    throw new Error('전신환 스프레드율은 0% 이상이어야 합니다.')
  }

  if (isInvalidNumber(input.preferentialRate)) {
    throw new Error('우대율을 입력해주세요.')
  }

  if (input.preferentialRate < 0 || input.preferentialRate > 100) {
    throw new Error('우대율은 0% 이상 100% 이하로 입력해주세요.')
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
  const usdEquivalentAmount = resolveUsdEquivalentAmount(input.currencyCode, input.foreignAmount)
  const remittanceFee = calculateRemittanceFee(usdEquivalentAmount)
  const cableFee = CABLE_FEE
  const totalKrwCost = convertedKrwAmount + remittanceFee + cableFee

  return {
    currencyCode: input.currencyCode,
    appliedRate,
    convertedKrwAmount,
    remittanceFee,
    cableFee,
    totalKrwCost,
    currencyUnit,
  }
}
