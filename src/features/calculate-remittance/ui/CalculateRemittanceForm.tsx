import { useState, type ComponentType } from 'react'
import type { CurrencyCode } from '@/shared/config'
import {
  CURRENCY_OPTIONS,
  formatCurrencyUnitLabel,
  getCurrencyConfig,
  isHundredUnitCurrency,
} from '@/shared/config'
import { calculateRemittance, type RemittanceCalculationResult } from '@/entities/remittance'
import type { TransactionCalculationSnapshot } from '@/entities/transaction'
import { formatForeignAmount, formatKrw, formatPercent, formatRate } from '@/shared/lib'
import { Button, Card, Input, Select } from '@/shared/ui'

type RateInputSource = 'manual' | 'api'

export interface RemittanceRateLoaderProps {
  currencyCode: CurrencyCode | ''
  onLoaded: (
    rate: number,
    meta: { quotedDate: string; unit: 1 | 100; isPreviousBusinessDay: boolean },
  ) => void
  onSourceChange: (source: RateInputSource) => void
  onError: (message: string) => void
}

export interface RemittanceRateNoticeProps {
  source: RateInputSource
  quotedDate?: string
  isPreviousBusinessDay?: boolean
  currencyCode: CurrencyCode | ''
  unit?: 1 | 100
}

const FORM_GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2'

const REMITTANCE_FEE_ROWS = [
  { criteria: 'USD 500달러 상당액 이하', fee: '5,000원' },
  { criteria: 'USD 2,000달러 상당액 이하', fee: '10,000원' },
  { criteria: 'USD 5,000달러 상당액 이하', fee: '15,000원' },
  { criteria: 'USD 10,000달러 상당액 이하', fee: '20,000원' },
  { criteria: 'USD 10,000달러 상당액 초과', fee: '25,000원' },
] as const

interface CalculateRemittanceFormProps {
  embedded?: boolean
  onSnapshotChange?: (snapshot: TransactionCalculationSnapshot | null) => void
  RateLoader: ComponentType<RemittanceRateLoaderProps>
  RateNotice: ComponentType<RemittanceRateNoticeProps>
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

function RemittanceFeeGuide() {
  return (
    <div className="md:col-span-2">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">해외송금 수수료 안내</h3>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-700">송금 금액 기준</th>
              <th className="px-3 py-2 text-right font-medium text-slate-700">송금수수료</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {REMITTANCE_FEE_ROWS.map((row) => (
              <tr key={row.criteria}>
                <td className="px-3 py-2 text-slate-700">{row.criteria}</td>
                <td className="px-3 py-2 text-right text-slate-900">{row.fee}</td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2 font-medium text-slate-700">전신료</td>
              <td className="px-3 py-2 text-right font-medium text-slate-900">건당 8,000원</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CalculateRemittanceForm({
  embedded = false,
  onSnapshotChange,
  RateLoader,
  RateNotice,
}: CalculateRemittanceFormProps) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode | ''>('')
  const [telegraphicSellingRate, setTelegraphicSellingRate] = useState('')
  const [rateSource, setRateSource] = useState<RateInputSource>('manual')
  const [quotedDate, setQuotedDate] = useState('')
  const [isPreviousBusinessDay, setIsPreviousBusinessDay] = useState(false)
  const [rateUnit, setRateUnit] = useState<1 | 100>(1)
  const [apiErrorMessage, setApiErrorMessage] = useState('')
  const [telegraphicSpreadRate, setTelegraphicSpreadRate] = useState('')
  const [preferentialRate, setPreferentialRate] = useState('')
  const [foreignAmount, setForeignAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<RemittanceCalculationResult | null>(null)

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
    setTelegraphicSellingRate('')

    if (nextCurrency) {
      const config = getCurrencyConfig(nextCurrency)
      setTelegraphicSpreadRate(String(config.defaultTelegraphicSpreadRate))
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

    const parsedTelegraphicSellingRate = parseNumber(telegraphicSellingRate)
    const parsedTelegraphicSpreadRate = parseNumber(telegraphicSpreadRate)
    const parsedPreferentialRate = parseNumber(preferentialRate)
    const parsedForeignAmount = parseNumber(foreignAmount)

    if (parsedForeignAmount === null) {
      setErrorMessage('송금 외화 금액을 입력해주세요.')
      return
    }

    if (parsedTelegraphicSellingRate === null) {
      setErrorMessage('전신환매도율을 입력해주세요.')
      return
    }

    if (parsedTelegraphicSpreadRate === null) {
      setErrorMessage('전신환 스프레드율을 입력해주세요.')
      return
    }

    if (parsedPreferentialRate === null) {
      setErrorMessage('우대율을 입력해주세요.')
      return
    }

    try {
      const calculationResult = calculateRemittance({
        currencyCode,
        telegraphicSellingRate: parsedTelegraphicSellingRate,
        telegraphicSpreadRate: parsedTelegraphicSpreadRate,
        preferentialRate: parsedPreferentialRate,
        foreignAmount: parsedForeignAmount,
      })

      setResult(calculationResult)
      onSnapshotChange?.({
        kind: 'REMITTANCE',
        currencyCode,
        transactionLabel: '해외송금',
        foreignAmount: parsedForeignAmount,
        appliedRate: calculationResult.appliedRate,
        krwAmount: calculationResult.totalKrwCost,
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
        <Input
          label="전신환매도율"
          name="telegraphicSellingRate"
          type="number"
          step="0.01"
          min="0"
          placeholder="예: 1375.20"
          value={telegraphicSellingRate}
          onChange={(event) => {
            setTelegraphicSellingRate(event.target.value)
            setRateSource('manual')
            setQuotedDate('')
            setIsPreviousBusinessDay(false)
          }}
        />
        <div className="flex items-end">
          <RateLoader
            currencyCode={currencyCode}
            onLoaded={(rate, meta) => {
              setTelegraphicSellingRate(String(rate))
              setQuotedDate(meta.quotedDate)
              setRateUnit(meta.unit)
              setIsPreviousBusinessDay(meta.isPreviousBusinessDay)
            }}
            onSourceChange={setRateSource}
            onError={setApiErrorMessage}
          />
        </div>
        {currencyCode && isHundredUnitCurrency(currencyCode) && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800 md:col-span-2">
            {currencyCode}는 {formatCurrencyUnitLabel(currencyCode)} 고시환율 기준으로 계산됩니다.
          </p>
        )}
        <RateNotice
          source={rateSource}
          quotedDate={quotedDate}
          isPreviousBusinessDay={isPreviousBusinessDay}
          currencyCode={currencyCode}
          unit={rateUnit}
        />
        {apiErrorMessage && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 md:col-span-2" role="status">
            {apiErrorMessage} 전신환매도율을 직접 입력한 뒤 계산을 계속할 수 있습니다.
          </p>
        )}
        <Input
          label="전신환 스프레드율 (%)"
          name="telegraphicSpreadRate"
          type="number"
          step="0.01"
          min="0"
          placeholder="예: 1.0"
          value={telegraphicSpreadRate}
          onChange={(event) => setTelegraphicSpreadRate(event.target.value)}
        />
        <Input
          label="우대율 (%)"
          name="preferentialRate"
          type="number"
          step="1"
          min="0"
          max="100"
          placeholder="예: 30"
          value={preferentialRate}
          onChange={(event) => setPreferentialRate(event.target.value)}
        />
        <Input
          label="송금 외화 금액"
          name="foreignAmount"
          type="number"
          step="1"
          min="0"
          placeholder="예: 1000"
          value={foreignAmount}
          onChange={(event) => setForeignAmount(event.target.value)}
        />
        <RemittanceFeeGuide />
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
    <Card title="해외송금 비용 결과">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">전신환 적용환율</dt>
          <dd className="font-medium text-slate-900">{formatRate(result.appliedRate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">원화 환산 송금원금</dt>
          <dd className="font-medium text-slate-900">{formatKrw(result.convertedKrwAmount)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">송금수수료</dt>
          <dd className="font-medium text-slate-900">{formatKrw(result.remittanceFee)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">전신료</dt>
          <dd className="font-medium text-slate-900">{formatKrw(result.cableFee)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">총 출금액</dt>
          <dd className="text-lg font-semibold text-blue-700">{formatKrw(result.totalKrwCost)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">송금 외화 금액</dt>
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
      <Card title="해외송금 계산">{formContent}</Card>
      {resultCard}
    </div>
  )
}
