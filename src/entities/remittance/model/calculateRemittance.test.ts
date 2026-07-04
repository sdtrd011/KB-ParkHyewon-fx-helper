import { describe, expect, it } from 'vitest'
import {
  calculateRemittance,
  calculateRemittanceFee,
  validateCableFeeAmount,
  validateRemittanceFeeAmount,
} from '@/entities/remittance'

describe('calculateRemittance', () => {
  it('USD 전신환 송금 시 적용환율과 원화 환산 금액을 계산한다', () => {
    const result = calculateRemittance({
      currencyCode: 'USD',
      telegraphicSellingRate: 1540.0,
      telegraphicSpreadRate: 1.0,
      preferentialRate: 0,
      foreignAmount: 1000,
    })

    expect(result.appliedRate).toBe(1555.4)
    expect(result.convertedKrwAmount).toBe(1_555_400)
  })

  it('USD 3,000달러 송금 시 총 출금액을 계산한다', () => {
    const result = calculateRemittance({
      currencyCode: 'USD',
      telegraphicSellingRate: 1320,
      telegraphicSpreadRate: 1.0,
      preferentialRate: 0,
      foreignAmount: 3000,
    })

    expect(result.appliedRate).toBe(1333.2)
    expect(result.convertedKrwAmount).toBe(3_999_600)
    expect(result.remittanceFee).toBe(15_000)
    expect(result.cableFee).toBe(8_000)
    expect(result.totalKrwCost).toBe(4_022_600)
  })

  it('외화 금액이 0 이하이면 Error를 던진다', () => {
    expect(() =>
      calculateRemittance({
        currencyCode: 'USD',
        telegraphicSellingRate: 1320,
        telegraphicSpreadRate: 1.0,
        preferentialRate: 0,
        foreignAmount: 0,
      }),
    ).toThrow()
  })

  it('우대율이 음수이거나 100을 초과하면 Error를 던진다', () => {
    expect(() =>
      calculateRemittance({
        currencyCode: 'USD',
        telegraphicSellingRate: 1320,
        telegraphicSpreadRate: 1.0,
        preferentialRate: -1,
        foreignAmount: 1000,
      }),
    ).toThrow()

    expect(() =>
      calculateRemittance({
        currencyCode: 'USD',
        telegraphicSellingRate: 1320,
        telegraphicSpreadRate: 1.0,
        preferentialRate: 101,
        foreignAmount: 1000,
      }),
    ).toThrow()
  })
})

describe('calculateRemittanceFee', () => {
  it.each([
    { amount: 500, expectedFee: 5_000 },
    { amount: 501, expectedFee: 10_000 },
    { amount: 2000, expectedFee: 10_000 },
    { amount: 2001, expectedFee: 15_000 },
    { amount: 5000, expectedFee: 15_000 },
    { amount: 5001, expectedFee: 20_000 },
    { amount: 10000, expectedFee: 20_000 },
    { amount: 10001, expectedFee: 25_000 },
  ])('USD $amount 송금 시 송금수수료는 $expectedFee원이다', ({ amount, expectedFee }) => {
    expect(calculateRemittanceFee(amount)).toBe(expectedFee)
  })
})

describe('수수료 검증', () => {
  it('송금수수료가 음수이면 Error를 던진다', () => {
    expect(() => validateRemittanceFeeAmount(-1)).toThrow()
  })

  it('전신료가 음수이면 Error를 던진다', () => {
    expect(() => validateCableFeeAmount(-1)).toThrow()
  })
})
