import { describe, expect, it, vi, beforeEach } from 'vitest'
import { loadExchangeRateQuote, loadRemittanceExchangeRates } from '@/entities/exchange-rate'
import { ExchangeRateDateNotAvailableError } from '@/shared/api'
import { DEFAULT_USD_BASE_RATE } from '@/shared/config'

const mockFetchKoreaEximExchangeRates = vi.fn()

vi.mock('@/shared/api', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api')>('@/shared/api')

  return {
    ...actual,
    fetchKoreaEximExchangeRates: (...args: unknown[]) => mockFetchKoreaEximExchangeRates(...args),
  }
})

const USD_ITEM = {
  result: 1,
  cur_unit: 'USD',
  deal_bas_r: '1,396.16',
  tts: '1,410.12',
  cur_nm: '미국 달러',
}

const JPY_ITEM = {
  result: 1,
  cur_unit: 'JPY(100)',
  deal_bas_r: '945.67',
  tts: '950.00',
  cur_nm: '일본 옌',
}

function formatSearchDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

describe('loadExchangeRateQuote', () => {
  beforeEach(() => {
    mockFetchKoreaEximExchangeRates.mockReset()
  })

  it('오늘 데이터가 없으면 전 영업일 환율을 조회한다', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todaySearchDate = formatSearchDate(today)
    const yesterdaySearchDate = formatSearchDate(yesterday)

    mockFetchKoreaEximExchangeRates
      .mockRejectedValueOnce(new ExchangeRateDateNotAvailableError(todaySearchDate))
      .mockResolvedValueOnce({ searchDate: yesterdaySearchDate, items: [USD_ITEM] })

    const quote = await loadExchangeRateQuote('USD')

    expect(mockFetchKoreaEximExchangeRates).toHaveBeenCalledTimes(2)
    expect(quote.baseRate).toBe(1396.16)
    expect(quote.quotedDate).toBe(yesterdaySearchDate)
    expect(quote.isPreviousBusinessDay).toBe(true)
  })

  it('오늘 데이터가 있으면 당일 환율을 반환한다', async () => {
    const todaySearchDate = formatSearchDate(new Date())

    mockFetchKoreaEximExchangeRates.mockResolvedValueOnce({
      searchDate: todaySearchDate,
      items: [USD_ITEM],
    })

    const quote = await loadExchangeRateQuote('USD')

    expect(mockFetchKoreaEximExchangeRates).toHaveBeenCalledTimes(1)
    expect(quote.quotedDate).toBe(todaySearchDate)
    expect(quote.isPreviousBusinessDay).toBe(false)
  })

  it('7일 이내 데이터가 없으면 안내 메시지를 던진다', async () => {
    mockFetchKoreaEximExchangeRates.mockImplementation((searchDate: string) =>
      Promise.reject(new ExchangeRateDateNotAvailableError(searchDate)),
    )

    await expect(loadExchangeRateQuote('USD')).rejects.toThrow(
      '최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.',
    )
    expect(mockFetchKoreaEximExchangeRates).toHaveBeenCalledTimes(7)
  })
})

describe('loadRemittanceExchangeRates', () => {
  beforeEach(() => {
    mockFetchKoreaEximExchangeRates.mockReset()
  })

  it('USD 송금 환율 조회 시 선택 통화 quote를 usdBaseRate로 재사용한다', async () => {
    const todaySearchDate = formatSearchDate(new Date())

    mockFetchKoreaEximExchangeRates.mockResolvedValueOnce({
      searchDate: todaySearchDate,
      items: [USD_ITEM],
    })

    const result = await loadRemittanceExchangeRates('USD')

    expect(mockFetchKoreaEximExchangeRates).toHaveBeenCalledTimes(1)
    expect(result.telegraphicSellingRate).toBe(1410.12)
    expect(result.unit).toBe(1)
    expect(result.usdBaseRate).toBe(1396.16)
    expect(result.usdBaseRateFromApi).toBe(true)
    expect(result.usdBaseRate).not.toBe(DEFAULT_USD_BASE_RATE)
    expect(result.quotedDate).toBe(todaySearchDate)
    expect(result.isPreviousBusinessDay).toBe(false)
  })

  it('USD 외 통화 송금 환율 조회 시 선택 통화와 USD 매매기준율을 각각 반환한다', async () => {
    const todaySearchDate = formatSearchDate(new Date())

    mockFetchKoreaEximExchangeRates.mockResolvedValueOnce({
      searchDate: todaySearchDate,
      items: [JPY_ITEM, USD_ITEM],
    })

    const result = await loadRemittanceExchangeRates('JPY')

    expect(mockFetchKoreaEximExchangeRates).toHaveBeenCalledTimes(1)
    expect(result.telegraphicSellingRate).toBe(950)
    expect(result.unit).toBe(100)
    expect(result.usdBaseRate).toBe(1396.16)
    expect(result.usdBaseRateFromApi).toBe(true)
    expect(result.usdBaseRate).not.toBe(DEFAULT_USD_BASE_RATE)
    expect(result.usdBaseRate).not.toBe(result.telegraphicSellingRate)
    expect(result.quotedDate).toBe(todaySearchDate)
    expect(result.isPreviousBusinessDay).toBe(false)
  })
})
