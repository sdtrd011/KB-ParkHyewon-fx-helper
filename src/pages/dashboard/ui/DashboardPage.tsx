import { useEffect, useState } from 'react'
import { getTransactions, type FxTransaction } from '@/entities/transaction'
import { CalculationPanel } from '@/widgets/calculation-panel'
import { TransactionHistoryPanel } from '@/widgets/transaction-history-panel'

export function DashboardPage() {
  const [transactions, setTransactions] = useState<FxTransaction[]>([])

  useEffect(() => {
    setTransactions(getTransactions())
  }, [])

  const handleTransactionsChange = (nextTransactions: FxTransaction[]) => {
    setTransactions(nextTransactions)
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">KB 외환 창구 도우미</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          환전 계산, 해외송금 비용 계산, 거래 기록을 한 화면에서 처리합니다.
        </p>
      </header>

      <section aria-label="외환 계산">
        <CalculationPanel onTransactionsChange={handleTransactionsChange} />
      </section>

      <section aria-label="거래 기록">
        <TransactionHistoryPanel
          transactions={transactions}
          onTransactionsChange={handleTransactionsChange}
        />
      </section>
    </main>
  )
}
