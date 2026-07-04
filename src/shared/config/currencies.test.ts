import { describe, expect, it } from 'vitest'
import {
  CURRENCY_CONFIGS,
  CURRENCY_OPTIONS,
  getCurrencyConfig,
  isHundredUnitCurrency,
} from '@/shared/config'

describe('currency config', () => {
  it('CNH 통화 설정을 제공한다', () => {
    const config = getCurrencyConfig('CNH')

    expect(config.code).toBe('CNH')
    expect(config.name).toBe('중국 위안')
    expect(config.unit).toBe(1)
    expect(config.defaultCashSpreadRate).toBe(2.0)
  })

  it('THB, SGD, IDR, HKD가 통화 목록에 포함된다', () => {
    const codes = CURRENCY_CONFIGS.map((currency) => currency.code)

    expect(codes).toContain('THB')
    expect(codes).toContain('SGD')
    expect(codes).toContain('IDR')
    expect(codes).toContain('HKD')
  })

  it('THB, SGD, IDR, HKD가 선택 옵션에 포함된다', () => {
    const optionValues = CURRENCY_OPTIONS.map((option) => option.value)

    expect(optionValues).toContain('THB')
    expect(optionValues).toContain('SGD')
    expect(optionValues).toContain('IDR')
    expect(optionValues).toContain('HKD')
  })

  it('JPY unit은 100이다', () => {
    expect(getCurrencyConfig('JPY').unit).toBe(100)
    expect(isHundredUnitCurrency('JPY')).toBe(true)
  })

  it('IDR unit은 100이다', () => {
    expect(getCurrencyConfig('IDR').unit).toBe(100)
    expect(isHundredUnitCurrency('IDR')).toBe(true)
  })
})
