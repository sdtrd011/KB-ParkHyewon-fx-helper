import { getCurrencyConfig } from '@/shared/config'
import type { KoreaEximExchangeRateItem } from '@/shared/api'
import {
  EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE,
  type ExchangeRateQuote,
  type SupportedExchangeCurrencyCode,
} from './types'

const API_CUR_UNIT_BY_CODE: Record<SupportedExchangeCurrencyCode, string> = {
  USD: 'USD',
  JPY: 'JPY(100)',
  EUR: 'EUR',
  CNH: 'CNH',
  THB: 'THB',
  SGD: 'SGD',
  IDR: 'IDR(100)',
  HKD: 'HKD',
}

function parseCommaNumber(value: string | undefined, fieldName: string): number {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} 값이 없습니다.`)
  }

  const parsed = Number(value.replace(/,/g, ''))

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} 값을 해석할 수 없습니다.`)
  }

  return parsed
}

function matchesCurrencyItem(
  item: KoreaEximExchangeRateItem,
  currencyCode: SupportedExchangeCurrencyCode,
): boolean {
  if (item.result !== 1) {
    return false
  }

  const targetCurUnit = API_CUR_UNIT_BY_CODE[currencyCode]

  return item.cur_unit === targetCurUnit || item.cur_unit === currencyCode
}

export function findExchangeRateQuote(
  items: KoreaEximExchangeRateItem[],
  currencyCode: SupportedExchangeCurrencyCode,
  quotedDate: string,
): ExchangeRateQuote {
  const matchedItem = items.find((item) => matchesCurrencyItem(item, currencyCode))

  if (!matchedItem) {
    throw new Error(EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE)
  }

  const { unit } = getCurrencyConfig(currencyCode)

  return {
    currencyCode,
    baseRate: parseCommaNumber(matchedItem.deal_bas_r, '매매기준율'),
    telegraphicSellingRate: parseCommaNumber(matchedItem.tts, '전신환매도율'),
    unit,
    quotedDate,
    isPreviousBusinessDay: false,
    source: 'KOREAEXIM',
  }
}
