import { describe, expect, it, vi, beforeEach } from 'vitest'
import { loadExchangeRateQuote } from '@/entities/exchange-rate'
import { ExchangeRateDateNotAvailableError } from '@/shared/api'

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
