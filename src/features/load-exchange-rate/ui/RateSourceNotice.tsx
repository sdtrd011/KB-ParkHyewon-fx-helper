import type { CurrencyCode } from '@/shared/config'
import { formatCurrencyUnitLabel } from '@/shared/config'

export type RateInputSource = 'manual' | 'api'

function formatQuotedDate(quotedDate: string): string {
  if (quotedDate.length !== 8) {
    return quotedDate
  }

  return `${quotedDate.slice(0, 4)}-${quotedDate.slice(4, 6)}-${quotedDate.slice(6, 8)}`
}

interface RateSourceNoticeProps {
  source: RateInputSource
  quotedDate?: string
  isPreviousBusinessDay?: boolean
  currencyCode: CurrencyCode | ''
  unit?: 1 | 100
}

export function RateSourceNotice({
  source,
  quotedDate,
  isPreviousBusinessDay = false,
  currencyCode,
  unit = 1,
}: RateSourceNoticeProps) {
  if (!currencyCode) {
    return null
  }

  const unitLabel = unit === 100 ? formatCurrencyUnitLabel(currencyCode) : '1단위당'

  if (source === 'api' && quotedDate) {
    const formattedDate = formatQuotedDate(quotedDate)
    const message = isPreviousBusinessDay
      ? `오늘은 환율 고시 데이터가 없어 전 영업일(${formattedDate}) 환율 정보를 불러왔습니다.`
      : `${formattedDate} 기준 환율 정보를 불러왔습니다.`

    return (
      <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 md:col-span-2">
        {message} ({unitLabel})
      </p>
    )
  }

  return (
    <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600 md:col-span-2">
      환율을 직접 입력 중입니다. ({unitLabel})
    </p>
  )
}
