import type { CurrencyCode } from '@/shared/config'

export type TransactionKind = 'EXCHANGE' | 'REMITTANCE'

export type TransactionCurrencyCode = CurrencyCode

export interface FxTransaction {
  id: string
  kind: TransactionKind
  customerName: string
  currencyCode: TransactionCurrencyCode
  transactionLabel: string
  foreignAmount: number
  appliedRate: number
  krwAmount: number
  preferentialRate?: number
  memo?: string
  createdAt: string
}

export interface TransactionCalculationSnapshot {
  kind: TransactionKind
  currencyCode: TransactionCurrencyCode
  transactionLabel: string
  foreignAmount: number
  appliedRate: number
  krwAmount: number
  preferentialRate: number
}
