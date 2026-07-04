import { STORAGE_KEYS } from '@/shared/config'
import type { FxTransaction } from './types'

function isLocalStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

function readTransactions(): FxTransaction[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.transactions)

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as FxTransaction[]
  } catch {
    return []
  }
}

export function getTransactions(): FxTransaction[] {
  return readTransactions()
}

export function saveTransactions(transactions: FxTransaction[]): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
}

export function addTransaction(transaction: FxTransaction): FxTransaction[] {
  const nextTransactions = [...readTransactions(), transaction]

  saveTransactions(nextTransactions)

  return nextTransactions
}

export function deleteTransaction(transactionId: string): FxTransaction[] {
  const nextTransactions = readTransactions().filter(
    (transaction) => transaction.id !== transactionId,
  )

  saveTransactions(nextTransactions)

  return nextTransactions
}

export function searchTransactions(
  transactions: FxTransaction[],
  keyword: string,
): FxTransaction[] {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return transactions
  }

  return transactions.filter((transaction) => {
    const customerName = transaction.customerName.toLowerCase()
    const currencyCode = transaction.currencyCode.toLowerCase()
    const memo = transaction.memo?.toLowerCase() ?? ''

    return (
      customerName.includes(normalizedKeyword) ||
      currencyCode.includes(normalizedKeyword) ||
      memo.includes(normalizedKeyword)
    )
  })
}
