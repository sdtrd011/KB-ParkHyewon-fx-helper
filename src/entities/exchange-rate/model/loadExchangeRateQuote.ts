import { ExchangeRateDateNotAvailableError, fetchKoreaEximExchangeRates } from '@/shared/api'
import { DEFAULT_USD_BASE_RATE, EXCHANGE_RATE_LOOKUP_DAYS } from '@/shared/config'
import { findExchangeRateQuote } from './parseKoreaEximRates'
import { EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE } from './types'
import type { ExchangeRateQuote, SupportedExchangeCurrencyCode } from './types'

export interface RemittanceExchangeRates {
  telegraphicSellingRate: number
  unit: 1 | 100
  quotedDate: string
  isPreviousBusinessDay: boolean
  usdBaseRate: number
  usdBaseRateFromApi: boolean
}

function formatSearchDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

function shiftDate(date: Date, offsetDays: number): Date {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() - offsetDays)
  return nextDate
}

function isRetriableLookupError(error: unknown): boolean {
  if (error instanceof ExchangeRateDateNotAvailableError) {
    return true
  }

  if (error instanceof Error) {
    return (
      error.message.includes(EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE) ||
      error.message.includes('환율 정보를 찾을 수 없습니다')
    )
  }

  return false
}

function resolveUsdBaseRateFromItems(
  items: Parameters<typeof findExchangeRateQuote>[0],
  quotedDate: string,
  existingQuote?: ExchangeRateQuote,
): { usdBaseRate: number; usdBaseRateFromApi: boolean } {
  if (existingQuote?.currencyCode === 'USD') {
    return {
      usdBaseRate: existingQuote.baseRate,
      usdBaseRateFromApi: true,
    }
  }

  try {
    const usdQuote = findExchangeRateQuote(items, 'USD', quotedDate)

    return {
      usdBaseRate: usdQuote.baseRate,
      usdBaseRateFromApi: true,
    }
  } catch {
    return {
      usdBaseRate: DEFAULT_USD_BASE_RATE,
      usdBaseRateFromApi: false,
    }
  }
}

export async function loadExchangeRateQuote(
  currencyCode: SupportedExchangeCurrencyCode,
): Promise<ExchangeRateQuote> {
  const today = new Date()
  const todaySearchDate = formatSearchDate(today)

  for (let dayOffset = 0; dayOffset < EXCHANGE_RATE_LOOKUP_DAYS; dayOffset += 1) {
    const searchDate = formatSearchDate(shiftDate(today, dayOffset))

    try {
      const { items } = await fetchKoreaEximExchangeRates(searchDate)
      const quote = findExchangeRateQuote(items, currencyCode, searchDate)

      return {
        ...quote,
        quotedDate: searchDate,
        isPreviousBusinessDay: searchDate !== todaySearchDate,
      }
    } catch (error) {
      const isLastAttempt = dayOffset === EXCHANGE_RATE_LOOKUP_DAYS - 1

      if (isLastAttempt) {
        if (isRetriableLookupError(error)) {
          throw new Error('최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.')
        }

        if (error instanceof Error) {
          throw error
        }

        throw new Error('환율 정보를 불러오지 못했습니다.')
      }

      if (!isRetriableLookupError(error)) {
        throw error
      }
    }
  }

  throw new Error('최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.')
}

export async function loadRemittanceExchangeRates(
  currencyCode: SupportedExchangeCurrencyCode,
): Promise<RemittanceExchangeRates> {
  const today = new Date()
  const todaySearchDate = formatSearchDate(today)

  for (let dayOffset = 0; dayOffset < EXCHANGE_RATE_LOOKUP_DAYS; dayOffset += 1) {
    const searchDate = formatSearchDate(shiftDate(today, dayOffset))

    try {
      const { items } = await fetchKoreaEximExchangeRates(searchDate)
      const quote = findExchangeRateQuote(items, currencyCode, searchDate)
      const { usdBaseRate, usdBaseRateFromApi } = resolveUsdBaseRateFromItems(
        items,
        searchDate,
        quote,
      )

      return {
        telegraphicSellingRate: quote.telegraphicSellingRate,
        unit: quote.unit,
        quotedDate: searchDate,
        isPreviousBusinessDay: searchDate !== todaySearchDate,
        usdBaseRate,
        usdBaseRateFromApi,
      }
    } catch (error) {
      const isLastAttempt = dayOffset === EXCHANGE_RATE_LOOKUP_DAYS - 1

      if (isLastAttempt) {
        if (isRetriableLookupError(error)) {
          throw new Error('최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.')
        }

        if (error instanceof Error) {
          throw error
        }

        throw new Error('환율 정보를 불러오지 못했습니다.')
      }

      if (!isRetriableLookupError(error)) {
        throw error
      }
    }
  }

  throw new Error('최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.')
}
