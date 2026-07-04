import { useState } from 'react'
import { AddTransactionForm } from '@/features/add-transaction'
import { CalculateExchangeForm } from '@/features/calculate-exchange'
import { LoadExchangeRateButton, RateSourceNotice } from '@/features/load-exchange-rate'
import type { FxTransaction, TransactionCalculationSnapshot } from '@/entities/transaction'

interface ExchangePanelProps {
  onTransactionsChange: (transactions: FxTransaction[]) => void
}

export function ExchangePanel({ onTransactionsChange }: ExchangePanelProps) {
  const [snapshot, setSnapshot] = useState<TransactionCalculationSnapshot | null>(null)

  return (
    <div className="space-y-6">
      <CalculateExchangeForm
        onSnapshotChange={setSnapshot}
        RateLoader={LoadExchangeRateButton}
        RateNotice={RateSourceNotice}
      />
      <AddTransactionForm snapshot={snapshot} onSaved={onTransactionsChange} />
    </div>
  )
}
