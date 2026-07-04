import type { CurrencyCode } from '@/shared/config'

export type ExchangeCurrencyCode = CurrencyCode

export type ExchangeTransactionType = 'CASH_BUY' | 'CASH_SELL'

export interface ExchangeCalculationInput {
  currencyCode: ExchangeCurrencyCode
  baseRate: number
  spreadRate: number
  preferentialRate: number
  foreignAmount: number
  transactionType: ExchangeTransactionType
}

export interface ExchangeCalculationResult {
  currencyCode: ExchangeCurrencyCode
  transactionType: ExchangeTransactionType
  appliedRate: number
  krwAmount: number
  currencyUnit: number
}
