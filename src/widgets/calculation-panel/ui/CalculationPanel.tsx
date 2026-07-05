import { useState } from 'react'
import { AddTransactionForm } from '@/features/add-transaction'
import { CalculateExchangeForm } from '@/features/calculate-exchange'
import { CalculateRemittanceForm } from '@/features/calculate-remittance'
import {
  LoadExchangeRateButton,
  LoadRemittanceRateButton,
  RateSourceNotice,
} from '@/features/load-exchange-rate'
import type { FxTransaction, TransactionCalculationSnapshot } from '@/entities/transaction'
import { Card } from '@/shared/ui'

type CalculationTab = 'exchange' | 'remittance'

const TABS: { id: CalculationTab; label: string }[] = [
  { id: 'exchange', label: '환전 계산' },
  { id: 'remittance', label: '해외송금 계산' },
]

interface CalculationPanelProps {
  onTransactionsChange: (transactions: FxTransaction[]) => void
}

export function CalculationPanel({ onTransactionsChange }: CalculationPanelProps) {
  const [activeTab, setActiveTab] = useState<CalculationTab>('exchange')
  const [exchangeSnapshot, setExchangeSnapshot] = useState<TransactionCalculationSnapshot | null>(
    null,
  )
  const [remittanceSnapshot, setRemittanceSnapshot] =
    useState<TransactionCalculationSnapshot | null>(null)

  const activeSnapshot = activeTab === 'exchange' ? exchangeSnapshot : remittanceSnapshot

  return (
    <div className="space-y-6">
      <Card>
        <nav
          className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700"
          aria-label="계산기 탭"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={activeTab === 'exchange' ? 'block' : 'hidden'}>
          <CalculateExchangeForm
            embedded
            onSnapshotChange={setExchangeSnapshot}
            RateLoader={LoadExchangeRateButton}
            RateNotice={RateSourceNotice}
          />
        </div>

        <div className={activeTab === 'remittance' ? 'block' : 'hidden'}>
          <CalculateRemittanceForm
            embedded
            onSnapshotChange={setRemittanceSnapshot}
            RateLoader={LoadRemittanceRateButton}
            RateNotice={RateSourceNotice}
          />
        </div>
      </Card>

      <AddTransactionForm snapshot={activeSnapshot} onSaved={onTransactionsChange} />
    </div>
  )
}
