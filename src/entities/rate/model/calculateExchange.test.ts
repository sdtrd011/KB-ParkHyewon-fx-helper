import { describe, expect, it } from 'vitest'
import { calculateExchange } from '@/entities/rate'

describe('calculateExchange', () => {
  it('USD 현찰 살 때 우대율 0%인 경우 적용환율과 원화 금액을 계산한다', () => {
    const result = calculateExchange({
      currencyCode: 'USD',
      baseRate: 1540.0,
      spreadRate: 1.75,
      preferentialRate: 0,
      foreignAmount: 500,
      transactionType: 'CASH_BUY',
    })

    expect(result.appliedRate).toBe(1566.95)
    expect(result.krwAmount).toBe(783475)
  })

  it('USD 현찰 살 때 우대율 80%인 경우 적용환율과 원화 금액을 계산한다', () => {
    const result = calculateExchange({
      currencyCode: 'USD',
      baseRate: 1540.0,
      spreadRate: 1.75,
      preferentialRate: 80,
      foreignAmount: 500,
      transactionType: 'CASH_BUY',
    })

    expect(result.appliedRate).toBe(1545.39)
    expect(result.krwAmount).toBe(772695)
  })

  it('USD 현찰 팔 때 우대율 0%인 경우 적용환율과 원화 금액을 계산한다', () => {
    const result = calculateExchange({
      currencyCode: 'USD',
      baseRate: 1540.0,
      spreadRate: 1.75,
      preferentialRate: 0,
      foreignAmount: 500,
      transactionType: 'CASH_SELL',
    })

    expect(result.appliedRate).toBe(1513.05)
    expect(result.krwAmount).toBe(756525)
  })

  it('JPY 현찰 살 때 100엔당 고시환율 기준으로 원화 금액을 계산한다', () => {
    const result = calculateExchange({
      currencyCode: 'JPY',
      baseRate: 980.0,
      spreadRate: 1.75,
      preferentialRate: 0,
      foreignAmount: 100_000,
      transactionType: 'CASH_BUY',
    })

    expect(result.appliedRate).toBe(997.15)
    expect(result.krwAmount).toBe(997_150)
    expect(result.currencyUnit).toBe(100)
  })

  it('우대율 100%인 USD 현찰 살 때 매매기준율이 그대로 적용환율이 된다', () => {
    const result = calculateExchange({
      currencyCode: 'USD',
      baseRate: 1540.0,
      spreadRate: 1.75,
      preferentialRate: 100,
      foreignAmount: 500,
      transactionType: 'CASH_BUY',
    })

    expect(result.appliedRate).toBe(1540.0)
    expect(result.krwAmount).toBe(770_000)
  })

  it('매매기준율이 0 이하이면 Error를 던진다', () => {
    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: 0,
        spreadRate: 1.75,
        preferentialRate: 0,
        foreignAmount: 500,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()

    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: -100,
        spreadRate: 1.75,
        preferentialRate: 0,
        foreignAmount: 500,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()
  })

  it('외화 금액이 0 이하이면 Error를 던진다', () => {
    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: 1540,
        spreadRate: 1.75,
        preferentialRate: 0,
        foreignAmount: 0,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()

    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: 1540,
        spreadRate: 1.75,
        preferentialRate: 0,
        foreignAmount: -500,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()
  })

  it('우대율이 음수이거나 100을 초과하면 Error를 던진다', () => {
    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: 1540,
        spreadRate: 1.75,
        preferentialRate: -1,
        foreignAmount: 500,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()

    expect(() =>
      calculateExchange({
        currencyCode: 'USD',
        baseRate: 1540,
        spreadRate: 1.75,
        preferentialRate: 101,
        foreignAmount: 500,
        transactionType: 'CASH_BUY',
      }),
    ).toThrow()
  })
})
