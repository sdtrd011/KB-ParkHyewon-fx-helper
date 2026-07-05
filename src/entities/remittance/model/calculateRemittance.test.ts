import { describe, expect, it } from 'vitest'
import {
  calculateRemittance,
  calculateRemittanceFee,
  resolveUsdEquivalentAmount,
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
    expect(result.usdEquivalentAmount).toBeCloseTo(3_999_600 / 1550, 5)
    expect(result.remittanceFee).toBe(15_000)
    expect(result.cableFee).toBe(8_000)
    expect(result.totalKrwCost).toBe(4_022_600)
  })

  it('JPY 5,000송금 시 USD 상당액 기준 송금수수료는 5,000원이다', () => {
    const result = calculateRemittance({
      currencyCode: 'JPY',
      telegraphicSellingRate: 980,
      telegraphicSpreadRate: 0,
      preferentialRate: 0,
      foreignAmount: 5000,
    })

    expect(result.convertedKrwAmount).toBe(49_000)
    expect(result.remittanceFee).toBe(5_000)
  })

  it('IDR 100,000송금 시 unit 100과 USD 상당액 기준으로 송금수수료를 산정한다', () => {
    const result = calculateRemittance({
      currencyCode: 'IDR',
      telegraphicSellingRate: 9.2,
      telegraphicSpreadRate: 0,
      preferentialRate: 0,
      foreignAmount: 100_000,
    })

    expect(result.convertedKrwAmount).toBe(9_200)
    expect(result.remittanceFee).toBe(5_000)
  })

  it('SGD 2,500송금 시 외화 금액 숫자가 아닌 USD 상당액 기준으로 송금수수료를 산정한다', () => {
    const result = calculateRemittance({
      currencyCode: 'SGD',
      telegraphicSellingRate: 1000,
      telegraphicSpreadRate: 0,
      preferentialRate: 0,
      foreignAmount: 2500,
    })

    expect(result.convertedKrwAmount).toBe(2_500_000)
    expect(result.remittanceFee).toBe(10_000)
  })

  it('HKD 2,500송금 시 USD 상당액 기준으로 송금수수료를 산정한다', () => {
    const result = calculateRemittance({
      currencyCode: 'HKD',
      telegraphicSellingRate: 175,
      telegraphicSpreadRate: 0,
      preferentialRate: 0,
      foreignAmount: 2500,
    })

    expect(result.convertedKrwAmount).toBe(437_500)
    expect(result.remittanceFee).toBe(5_000)
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

describe('resolveUsdEquivalentAmount', () => {
  it('원화 환산 송금원금을 USD 매매기준율로 나눈 값을 반환한다', () => {
    expect(resolveUsdEquivalentAmount(49_000, 1550)).toBeCloseTo(31.6129, 4)
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
