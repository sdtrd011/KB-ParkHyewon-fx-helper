import type { CurrencyCode } from '@/shared/config'

export type RemittanceCurrencyCode = CurrencyCode

export interface RemittanceCalculationInput {
  currencyCode: RemittanceCurrencyCode
  telegraphicSellingRate: number
  telegraphicSpreadRate: number
  preferentialRate: number
  foreignAmount: number
  /** 송금수수료 USD 상당액 산정용 USD 매매기준율. 미입력 시 DEFAULT_USD_BASE_RATE(1550) 사용 */
  usdBaseRate?: number
  /** true면 환율 API에서 가져온 USD 매매기준율, false면 기본값(1550) 적용 */
  usdBaseRateFromApi?: boolean
}

export interface RemittanceCalculationResult {
  currencyCode: RemittanceCurrencyCode
  appliedRate: number
  convertedKrwAmount: number
  usdEquivalentAmount: number
  usdBaseRate: number
  usdBaseRateFromApi: boolean
  remittanceFee: number
  cableFee: number
  totalKrwCost: number
  currencyUnit: number
}
