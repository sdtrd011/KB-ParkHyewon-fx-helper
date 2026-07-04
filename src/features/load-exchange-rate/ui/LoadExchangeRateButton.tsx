import { useState } from 'react'
import { loadExchangeRateQuote } from '@/entities/exchange-rate'
import type { CurrencyCode } from '@/shared/config'
import { Button } from '@/shared/ui'

export type ExchangeRateInputSource = 'manual' | 'api'

interface LoadExchangeRateButtonProps {
  currencyCode: CurrencyCode | ''
  disabled?: boolean
  onLoaded: (
    rate: number,
    meta: { quotedDate: string; unit: 1 | 100; isPreviousBusinessDay: boolean },
  ) => void
  onSourceChange: (source: ExchangeRateInputSource) => void
  onError: (message: string) => void
}

export function LoadExchangeRateButton({
  currencyCode,
  disabled = false,
  onLoaded,
  onSourceChange,
  onError,
}: LoadExchangeRateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!currencyCode) {
      onError('통화를 먼저 선택해주세요.')
      return
    }

    setIsLoading(true)
    onError('')

    try {
      const quote = await loadExchangeRateQuote(currencyCode)
      onLoaded(quote.baseRate, {
        quotedDate: quote.quotedDate,
        unit: quote.unit,
        isPreviousBusinessDay: quote.isPreviousBusinessDay,
      })
      onSourceChange('api')
    } catch (error) {
      onSourceChange('manual')
      onError(
        error instanceof Error
          ? error.message
          : '환율 정보를 불러오지 못했습니다. 매매기준율을 직접 입력해주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={disabled || isLoading || !currencyCode}
    >
      {isLoading ? '불러오는 중...' : '환율 불러오기'}
    </Button>
  )
}
