import { useState } from 'react'
import { AddTransactionForm } from '@/features/add-transaction'
import { CalculateRemittanceForm } from '@/features/calculate-remittance'
import { LoadRemittanceRateButton, RateSourceNotice } from '@/features/load-exchange-rate'
import type { FxTransaction, TransactionCalculationSnapshot } from '@/entities/transaction'

interface RemittancePanelProps {
  onTransactionsChange: (transactions: FxTransaction[]) => void
}

export function RemittancePanel({ onTransactionsChange }: RemittancePanelProps) {
  const [snapshot, setSnapshot] = useState<TransactionCalculationSnapshot | null>(null)

  return (
    <div className="space-y-6">
      <CalculateRemittanceForm
        onSnapshotChange={setSnapshot}
        RateLoader={LoadRemittanceRateButton}
        RateNotice={RateSourceNotice}
      />
      <AddTransactionForm snapshot={snapshot} onSaved={onTransactionsChange} />
    </div>
  )
}
