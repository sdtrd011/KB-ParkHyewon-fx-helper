import type { CurrencyCode } from '@/shared/config'

export type RemittanceCurrencyCode = CurrencyCode

export interface RemittanceCalculationInput {
  currencyCode: RemittanceCurrencyCode
  telegraphicSellingRate: number
  telegraphicSpreadRate: number
  preferentialRate: number
  foreignAmount: number
}

export interface RemittanceCalculationResult {
  currencyCode: RemittanceCurrencyCode
  appliedRate: number
  convertedKrwAmount: number
  remittanceFee: number
  cableFee: number
  totalKrwCost: number
  currencyUnit: number
}
