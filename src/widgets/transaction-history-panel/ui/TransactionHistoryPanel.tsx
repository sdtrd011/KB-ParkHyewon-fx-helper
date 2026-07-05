import { useMemo, useState } from 'react'
import {
  deleteTransaction,
  searchTransactions,
  type FxTransaction,
} from '@/entities/transaction'
import { TransactionSearchInput } from '@/features/search-transaction'
import { createCsvContent, downloadCsv, formatForeignAmount, formatKrw, formatRate } from '@/shared/lib'
import { Button, Card } from '@/shared/ui'

const CSV_HEADERS = [
  '거래일시',
  '고객명',
  '거래구분',
  '통화',
  '외화금액',
  '적용환율',
  '원화금액',
  '우대율',
  '메모',
]

interface TransactionHistoryPanelProps {
  transactions: FxTransaction[]
  onTransactionsChange: (transactions: FxTransaction[]) => void
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('ko-KR')
}

export function TransactionHistoryPanel({
  transactions,
  onTransactionsChange,
}: TransactionHistoryPanelProps) {
  const [searchKeyword, setSearchKeyword] = useState('')

  const filteredTransactions = useMemo(
    () => searchTransactions(transactions, searchKeyword),
    [transactions, searchKeyword],
  )

  const handleDelete = (transactionId: string) => {
    const nextTransactions = deleteTransaction(transactionId)
    onTransactionsChange(nextTransactions)
  }

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      return
    }

    const rows = transactions.map((transaction) => [
      formatDateTime(transaction.createdAt),
      transaction.customerName,
      transaction.transactionLabel,
      transaction.currencyCode,
      transaction.foreignAmount,
      transaction.appliedRate,
      transaction.krwAmount,
      transaction.preferentialRate ?? '',
      transaction.memo ?? '',
    ])

    const content = createCsvContent(CSV_HEADERS, rows)
    downloadCsv('fx-transactions.csv', content)
  }

  return (
    <Card title="거래 기록">
      <div className="space-y-4">
        <TransactionSearchInput value={searchKeyword} onChange={setSearchKeyword} />

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportCsv} disabled={transactions.length === 0}>
            CSV보내기
          </Button>
        </div>

        {transactions.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">저장된 거래 기록이 없습니다.</p>
        )}

        {transactions.length > 0 && filteredTransactions.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            검색 조건에 맞는 거래 기록이 없습니다.
          </p>
        )}

        {filteredTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                    거래일시
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                    고객명
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                    거래구분
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                    통화
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                    외화금액
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                    적용환율
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700 dark:text-slate-300">
                    원화금액
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300">
                    메모
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-slate-700 dark:text-slate-300">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-900">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700 dark:text-slate-300">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                      {transaction.customerName}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {transaction.transactionLabel}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {transaction.currencyCode}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                      {formatForeignAmount(transaction.foreignAmount, transaction.currencyCode)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">
                      {formatRate(transaction.appliedRate)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatKrw(transaction.krwAmount)}
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-2 text-slate-600 dark:text-slate-400">
                      {transaction.memo ?? '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button variant="danger" onClick={() => handleDelete(transaction.id)}>
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}
