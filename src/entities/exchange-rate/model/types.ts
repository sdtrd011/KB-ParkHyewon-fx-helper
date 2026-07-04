import type { CurrencyCode } from '@/shared/config'

export type SupportedExchangeCurrencyCode = CurrencyCode

export interface ExchangeRateQuote {
  currencyCode: SupportedExchangeCurrencyCode
  baseRate: number
  telegraphicSellingRate: number
  unit: 1 | 100
  quotedDate: string
  isPreviousBusinessDay: boolean
  source: 'KOREAEXIM'
}

export const EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE =
  '선택한 통화의 환율 정보를 찾을 수 없습니다. 직접 입력해주세요.'
