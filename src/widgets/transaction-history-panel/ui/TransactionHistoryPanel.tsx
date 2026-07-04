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
          <p className="text-sm text-slate-500">저장된 거래 기록이 없습니다.</p>
        )}

        {transactions.length > 0 && filteredTransactions.length === 0 && (
          <p className="text-sm text-slate-500">검색 조건에 맞는 거래 기록이 없습니다.</p>
        )}

        {filteredTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">거래일시</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">고객명</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">거래구분</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">통화</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">외화금액</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">적용환율</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">원화금액</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">메모</th>
                  <th className="px-3 py-2 text-center font-medium text-slate-700">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {transaction.customerName}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{transaction.transactionLabel}</td>
                    <td className="px-3 py-2 text-slate-700">{transaction.currencyCode}</td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {formatForeignAmount(transaction.foreignAmount, transaction.currencyCode)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {formatRate(transaction.appliedRate)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">
                      {formatKrw(transaction.krwAmount)}
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-2 text-slate-600">
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
