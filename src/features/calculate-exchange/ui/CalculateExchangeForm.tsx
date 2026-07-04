import { useState, type ComponentType } from 'react'
import type { CurrencyCode } from '@/shared/config'
import {
  CURRENCY_OPTIONS,
  formatCurrencyUnitLabel,
  getCurrencyConfig,
  isHundredUnitCurrency,
} from '@/shared/config'
import {
  calculateExchange,
  type ExchangeCalculationResult,
  type ExchangeTransactionType,
} from '@/entities/rate'
import type { TransactionCalculationSnapshot } from '@/entities/transaction'
import { formatForeignAmount, formatKrw, formatPercent, formatRate } from '@/shared/lib'
import { Button, Card, Input, Select } from '@/shared/ui'

type RateInputSource = 'manual' | 'api'

export interface ExchangeRateLoaderProps {
  currencyCode: CurrencyCode | ''
  onLoaded: (
    rate: number,
    meta: { quotedDate: string; unit: 1 | 100; isPreviousBusinessDay: boolean },
  ) => void
  onSourceChange: (source: RateInputSource) => void
  onError: (message: string) => void
}

export interface ExchangeRateNoticeProps {
  source: RateInputSource
  quotedDate?: string
  isPreviousBusinessDay?: boolean
  currencyCode: CurrencyCode | ''
  unit?: 1 | 100
}

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'CASH_BUY', label: '현찰 살 때' },
  { value: 'CASH_SELL', label: '현찰 팔 때' },
] as const

const TRANSACTION_LABELS: Record<ExchangeTransactionType, string> = {
  CASH_BUY: '현찰 살 때',
  CASH_SELL: '현찰 팔 때',
}

const FORM_GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2'

interface CalculateExchangeFormProps {
  embedded?: boolean
  onSnapshotChange?: (snapshot: TransactionCalculationSnapshot | null) => void
  RateLoader: ComponentType<ExchangeRateLoaderProps>
  RateNotice: ComponentType<ExchangeRateNoticeProps>
}

function parseNumber(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

export function CalculateExchangeForm({
  embedded = false,
  onSnapshotChange,
  RateLoader,
  RateNotice,
}: CalculateExchangeFormProps) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode | ''>('')
  const [transactionType, setTransactionType] = useState<ExchangeTransactionType>('CASH_BUY')
  const [baseRate, setBaseRate] = useState('')
  const [rateSource, setRateSource] = useState<RateInputSource>('manual')
  const [quotedDate, setQuotedDate] = useState('')
  const [isPreviousBusinessDay, setIsPreviousBusinessDay] = useState(false)
  const [rateUnit, setRateUnit] = useState<1 | 100>(1)
  const [apiErrorMessage, setApiErrorMessage] = useState('')
  const [spreadRate, setSpreadRate] = useState('')
  const [preferentialRate, setPreferentialRate] = useState('')
  const [foreignAmount, setForeignAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<ExchangeCalculationResult | null>(null)

  const handleCurrencyChange = (value: string) => {
    const nextCurrency = value as CurrencyCode | ''

    setCurrencyCode(nextCurrency)
    setResult(null)
    onSnapshotChange?.(null)
    setErrorMessage('')
    setApiErrorMessage('')
    setRateSource('manual')
    setQuotedDate('')
    setIsPreviousBusinessDay(false)
    setRateUnit(nextCurrency ? getCurrencyConfig(nextCurrency).unit : 1)
    setBaseRate('')

    if (nextCurrency) {
      const config = getCurrencyConfig(nextCurrency)
      setSpreadRate(String(config.defaultCashSpreadRate))
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setResult(null)
    onSnapshotChange?.(null)

    if (!currencyCode) {
      setErrorMessage('통화를 선택해주세요.')
      return
    }

    const parsedBaseRate = parseNumber(baseRate)
    const parsedSpreadRate = parseNumber(spreadRate)
    const parsedPreferentialRate = parseNumber(preferentialRate)
    const parsedForeignAmount = parseNumber(foreignAmount)

    if (parsedBaseRate === null) {
      setErrorMessage('매매기준율을 입력해주세요.')
      return
    }

    if (parsedSpreadRate === null) {
      setErrorMessage('스프레드율을 입력해주세요.')
      return
    }

    if (parsedPreferentialRate === null) {
      setErrorMessage('우대율을 입력해주세요.')
      return
    }

    if (parsedForeignAmount === null) {
      setErrorMessage('외화 금액을 입력해주세요.')
      return
    }

    try {
      const calculationResult = calculateExchange({
        currencyCode,
        baseRate: parsedBaseRate,
        spreadRate: parsedSpreadRate,
        preferentialRate: parsedPreferentialRate,
        foreignAmount: parsedForeignAmount,
        transactionType,
      })

      setResult(calculationResult)
      onSnapshotChange?.({
        kind: 'EXCHANGE',
        currencyCode,
        transactionLabel: TRANSACTION_LABELS[transactionType],
        foreignAmount: parsedForeignAmount,
        appliedRate: calculationResult.appliedRate,
        krwAmount: calculationResult.krwAmount,
        preferentialRate: parsedPreferentialRate,
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '계산 중 오류가 발생했습니다.')
    }
  }

  const formContent = (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className={FORM_GRID_CLASS}>
        <Select
          label="통화"
          name="currency"
          value={currencyCode}
          onChange={(event) => handleCurrencyChange(event.target.value)}
          options={[{ value: '', label: '통화를 선택하세요' }, ...CURRENCY_OPTIONS]}
        />
        <Select
          label="거래 구분"
          name="transactionType"
          value={transactionType}
          onChange={(event) => setTransactionType(event.target.value as ExchangeTransactionType)}
          options={[...TRANSACTION_TYPE_OPTIONS]}
        />
        {currencyCode && isHundredUnitCurrency(currencyCode) && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800 md:col-span-2">
            {currencyCode}는 {formatCurrencyUnitLabel(currencyCode)} 고시환율 기준으로 계산됩니다.
          </p>
        )}
        <Input
          label="매매기준율"
          name="baseRate"
          type="number"
          step="0.01"
          min="0"
          placeholder="예: 1380.50"
          value={baseRate}
          onChange={(event) => {
            setBaseRate(event.target.value)
            setRateSource('manual')
            setQuotedDate('')
            setIsPreviousBusinessDay(false)
          }}
        />
        <div className="flex items-end">
          <RateLoader
            currencyCode={currencyCode}
            onLoaded={(rate, meta) => {
              setBaseRate(String(rate))
              setQuotedDate(meta.quotedDate)
              setRateUnit(meta.unit)
              setIsPreviousBusinessDay(meta.isPreviousBusinessDay)
            }}
            onSourceChange={setRateSource}
            onError={setApiErrorMessage}
          />
        </div>
        <RateNotice
          source={rateSource}
          quotedDate={quotedDate}
          isPreviousBusinessDay={isPreviousBusinessDay}
          currencyCode={currencyCode}
          unit={rateUnit}
        />
        {apiErrorMessage && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 md:col-span-2" role="status">
            {apiErrorMessage} 매매기준율을 직접 입력한 뒤 계산을 계속할 수 있습니다.
          </p>
        )}
        <Input
          label="스프레드율 (%)"
          name="spreadRate"
          type="number"
          step="0.01"
          min="0"
          placeholder="예: 1.75"
          value={spreadRate}
          onChange={(event) => setSpreadRate(event.target.value)}
        />
        <Input
          label="우대율 (%)"
          name="preferentialRate"
          type="number"
          step="1"
          min="0"
          max="100"
          placeholder="예: 50"
          value={preferentialRate}
          onChange={(event) => setPreferentialRate(event.target.value)}
        />
        <Input
          label="외화 금액"
          name="foreignAmount"
          type="number"
          step="1"
          min="0"
          placeholder="예: 1000"
          value={foreignAmount}
          onChange={(event) => setForeignAmount(event.target.value)}
        />
      </div>
      {errorMessage && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
      <Button type="submit">계산하기</Button>
    </form>
  )

  const resultCard = result && (
    <Card title="환전 계산 결과">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">거래 구분</dt>
          <dd className="font-medium text-slate-900">
            {TRANSACTION_LABELS[result.transactionType]}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">통화 단위</dt>
          <dd className="font-medium text-slate-900">
            {formatCurrencyUnitLabel(result.currencyCode)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">적용환율</dt>
          <dd className="font-medium text-slate-900">{formatRate(result.appliedRate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">원화 금액</dt>
          <dd className="font-medium text-blue-700">{formatKrw(result.krwAmount)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">외화 금액</dt>
          <dd className="font-medium text-slate-900">
            {formatForeignAmount(Number(foreignAmount), result.currencyCode)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">우대율</dt>
          <dd className="font-medium text-slate-900">{formatPercent(Number(preferentialRate))}</dd>
        </div>
      </dl>
    </Card>
  )

  if (embedded) {
    return (
      <div className="space-y-6">
        {formContent}
        {resultCard}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card title="환전 계산">{formContent}</Card>
      {resultCard}
    </div>
  )
}
