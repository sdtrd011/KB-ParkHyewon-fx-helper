import { useEffect, useState } from 'react'
import { addTransaction, type FxTransaction, type TransactionCalculationSnapshot } from '@/entities/transaction'
import { Button, Card, Input } from '@/shared/ui'

const PRIVACY_NOTICE =
  '실제 주민등록번호, 계좌번호, 주소 등 민감한 개인정보는 입력하지 마세요. 본 기록은 현재 브라우저의 localStorage에만 저장됩니다.'

interface AddTransactionFormProps {
  snapshot: TransactionCalculationSnapshot | null
  onSaved: (transactions: FxTransaction[]) => void
}

export function AddTransactionForm({ snapshot, onSaved }: AddTransactionFormProps) {
  const [customerName, setCustomerName] = useState('')
  const [memo, setMemo] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('')
    }, 2000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [successMessage])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!customerName.trim()) {
      setErrorMessage('고객명을 입력해주세요.')
      return
    }

    if (!snapshot) {
      setErrorMessage('먼저 계산을 완료한 뒤 거래 기록을 저장해주세요.')
      return
    }

    const transaction: FxTransaction = {
      id: crypto.randomUUID(),
      kind: snapshot.kind,
      customerName: customerName.trim(),
      currencyCode: snapshot.currencyCode,
      transactionLabel: snapshot.transactionLabel,
      foreignAmount: snapshot.foreignAmount,
      appliedRate: snapshot.appliedRate,
      krwAmount: snapshot.krwAmount,
      preferentialRate: snapshot.preferentialRate,
      memo: memo.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    const nextTransactions = addTransaction(transaction)

    onSaved(nextTransactions)
    setSuccessMessage('거래 기록이 저장되었습니다.')
    setCustomerName('')
    setMemo('')
  }

  return (
    <Card title="거래 기록 추가">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="고객명"
          name="customerName"
          placeholder="고객 이름 또는 임시 식별명"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          required
        />
        <Input
          label="메모"
          name="memo"
          placeholder="상담 내용 또는 참고사항 (선택)"
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
        />
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {PRIVACY_NOTICE}
        </p>
        {errorMessage && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300" role="status">
            {successMessage}
          </p>
        )}
        <Button type="submit">거래 기록 저장</Button>
      </form>
    </Card>
  )
}
