import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@/shared/config'
import type { FxTransaction } from '@/entities/transaction'
import {
  addTransaction,
  deleteTransaction,
  getTransactions,
  searchTransactions,
} from '@/entities/transaction'

function createTransaction(overrides: Partial<FxTransaction> = {}): FxTransaction {
  return {
    id: 'tx-1',
    kind: 'EXCHANGE',
    customerName: '홍길동',
    currencyCode: 'USD',
    transactionLabel: '현찰 살 때',
    foreignAmount: 500,
    appliedRate: 1566.95,
    krwAmount: 783475,
    memo: '환전 상담',
    createdAt: '2026-07-04T10:00:00.000Z',
    ...overrides,
  }
}

describe('transaction storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('거래 기록을 저장하면 목록에 즉시 포함된다', () => {
    const transaction = createTransaction()

    const savedTransactions = addTransaction(transaction)

    expect(savedTransactions).toHaveLength(1)
    expect(savedTransactions[0]).toEqual(transaction)
    expect(getTransactions()).toEqual(savedTransactions)
  })

  it('고객명으로 검색하면 해당 고객 기록만 반환된다', () => {
    const transactions = [
      createTransaction({ id: 'tx-1', customerName: '홍길동' }),
      createTransaction({ id: 'tx-2', customerName: '김철수' }),
    ]

    const result = searchTransactions(transactions, '홍길동')

    expect(result).toHaveLength(1)
    expect(result[0]?.customerName).toBe('홍길동')
  })

  it('통화 코드로 검색하면 해당 통화 기록만 반환된다', () => {
    const transactions = [
      createTransaction({ id: 'tx-1', currencyCode: 'USD' }),
      createTransaction({ id: 'tx-2', currencyCode: 'JPY' }),
    ]

    const result = searchTransactions(transactions, 'JPY')

    expect(result).toHaveLength(1)
    expect(result[0]?.currencyCode).toBe('JPY')
  })

  it('메모 키워드로 검색하면 해당 메모가 포함된 기록만 반환된다', () => {
    const transactions = [
      createTransaction({ id: 'tx-1', memo: '해외여행 환전' }),
      createTransaction({ id: 'tx-2', memo: '유학 송금 상담' }),
    ]

    const result = searchTransactions(transactions, '여행')

    expect(result).toHaveLength(1)
    expect(result[0]?.memo).toContain('여행')
  })

  it('삭제 후 해당 id의 기록이 없어진다', () => {
    addTransaction(createTransaction({ id: 'tx-1' }))
    addTransaction(createTransaction({ id: 'tx-2', customerName: '김철수' }))

    const remainingTransactions = deleteTransaction('tx-1')

    expect(remainingTransactions).toHaveLength(1)
    expect(remainingTransactions.find((transaction) => transaction.id === 'tx-1')).toBeUndefined()
    expect(getTransactions()).toEqual(remainingTransactions)
  })

  it('localStorage에 저장된 기록은 다시 조회해도 유지된다', () => {
    const transaction = createTransaction({ id: 'tx-persist' })

    addTransaction(transaction)

    const raw = localStorage.getItem(STORAGE_KEYS.transactions)
    expect(raw).not.toBeNull()

    const reloadedTransactions = getTransactions()

    expect(reloadedTransactions).toHaveLength(1)
    expect(reloadedTransactions[0]?.id).toBe('tx-persist')
  })
})
