import { describe, expect, it } from 'vitest'
import {
  EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE,
  findExchangeRateQuote,
} from '@/entities/exchange-rate'
import type { KoreaEximExchangeRateItem } from '@/shared/api'

const SAMPLE_ITEMS: KoreaEximExchangeRateItem[] = [
  {
    result: 1,
    cur_unit: 'USD',
    deal_bas_r: '1,396.16',
    tts: '1,410.12',
    cur_nm: '미국 달러',
  },
  {
    result: 1,
    cur_unit: 'JPY(100)',
    deal_bas_r: '959.72',
    tts: '969.31',
    cur_nm: '일본 엔',
  },
  {
    result: 1,
    cur_unit: 'EUR',
    deal_bas_r: '1,512.34',
    tts: '1,520.00',
    cur_nm: '유로',
  },
  {
    result: 1,
    cur_unit: 'CNH',
    deal_bas_r: '192.15',
    tts: '194.00',
    cur_nm: '중국 위안',
  },
  {
    result: 1,
    cur_unit: 'IDR(100)',
    deal_bas_r: '8.52',
    tts: '8.60',
    cur_nm: '인도네시아 루피아',
  },
]

describe('findExchangeRateQuote', () => {
  it('USD 매매기준율과 전신환매도율을 파싱한다', () => {
    const quote = findExchangeRateQuote(SAMPLE_ITEMS, 'USD', '20260704')

    expect(quote.baseRate).toBe(1396.16)
    expect(quote.telegraphicSellingRate).toBe(1410.12)
    expect(quote.unit).toBe(1)
  })

  it('JPY는 100엔당 고시환율 단위로 파싱한다', () => {
    const quote = findExchangeRateQuote(SAMPLE_ITEMS, 'JPY', '20260704')

    expect(quote.baseRate).toBe(959.72)
    expect(quote.telegraphicSellingRate).toBe(969.31)
    expect(quote.unit).toBe(100)
  })

  it('CNH를 API 응답에서 매핑한다', () => {
    const quote = findExchangeRateQuote(SAMPLE_ITEMS, 'CNH', '20260704')

    expect(quote.baseRate).toBe(192.15)
    expect(quote.telegraphicSellingRate).toBe(194.0)
    expect(quote.unit).toBe(1)
  })

  it('IDR(100) 응답을 IDR 100단위 환율로 파싱한다', () => {
    const quote = findExchangeRateQuote(SAMPLE_ITEMS, 'IDR', '20260704')

    expect(quote.baseRate).toBe(8.52)
    expect(quote.telegraphicSellingRate).toBe(8.6)
    expect(quote.unit).toBe(100)
  })

  it('선택한 통화를 찾지 못하면 안내 메시지와 함께 Error를 던진다', () => {
    expect(() => findExchangeRateQuote([], 'USD', '20260704')).toThrow(
      EXCHANGE_RATE_CURRENCY_NOT_FOUND_MESSAGE,
    )
  })
})
