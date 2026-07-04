import {
  EXCHANGE_RATE_PROXY_PATH,
  KOREA_EXIM_EXCHANGE_API_URL,
  KOREA_EXIM_EXCHANGE_DATA_TYPE,
} from '@/shared/config'
import { ExchangeRateDateNotAvailableError } from './errors'
import type { KoreaEximExchangeRateItem, KoreaEximExchangeRatesResult } from './types'

function buildFetchUrl(searchDate: string): string {
  if (import.meta.env.DEV) {
    return `${EXCHANGE_RATE_PROXY_PATH}?searchdate=${searchDate}&data=${KOREA_EXIM_EXCHANGE_DATA_TYPE}`
  }

  const apiKey = import.meta.env.VITE_EXCHANGE_API_KEY

  if (!apiKey) {
    throw new Error(
      '환율 API 키가 설정되지 않았습니다. .env 파일에 VITE_EXCHANGE_API_KEY를 설정해주세요.',
    )
  }

  const params = new URLSearchParams({
    authkey: apiKey,
    searchdate: searchDate,
    data: KOREA_EXIM_EXCHANGE_DATA_TYPE,
  })

  return `${KOREA_EXIM_EXCHANGE_API_URL}?${params.toString()}`
}

function extractValidItems(data: unknown): KoreaEximExchangeRateItem[] {
  if (data === null) {
    return []
  }

  if (!Array.isArray(data)) {
    throw new Error('환율 API 응답 형식이 올바르지 않습니다.')
  }

  return data.filter(
    (item): item is KoreaEximExchangeRateItem =>
      typeof item === 'object' &&
      item !== null &&
      item.result === 1 &&
      typeof item.cur_unit === 'string' &&
      item.cur_unit.length > 0,
  )
}

export async function fetchKoreaEximExchangeRates(
  searchDate: string,
): Promise<KoreaEximExchangeRatesResult> {
  const response = await fetch(buildFetchUrl(searchDate))

  if (!response.ok) {
    throw new Error('환율 API 요청에 실패했습니다.')
  }

  const data: unknown = await response.json()
  const items = extractValidItems(data)

  if (items.length === 0) {
    throw new ExchangeRateDateNotAvailableError(searchDate)
  }

  return { searchDate, items }
}
