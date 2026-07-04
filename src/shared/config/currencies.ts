export type CurrencyCode =
  | 'USD'
  | 'JPY'
  | 'EUR'
  | 'CNH'
  | 'THB'
  | 'SGD'
  | 'IDR'
  | 'HKD'

export interface CurrencyConfig {
  code: CurrencyCode
  name: string
  unit: 1 | 100
  defaultCashSpreadRate: number
  defaultTelegraphicSpreadRate: number
}

export const CURRENCY_CONFIGS: CurrencyConfig[] = [
  {
    code: 'USD',
    name: '미국 달러',
    unit: 1,
    defaultCashSpreadRate: 1.75,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'JPY',
    name: '일본 엔',
    unit: 100,
    defaultCashSpreadRate: 1.75,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'EUR',
    name: '유로',
    unit: 1,
    defaultCashSpreadRate: 1.99,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'CNH',
    name: '중국 위안',
    unit: 1,
    defaultCashSpreadRate: 2.0,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'THB',
    name: '태국 바트',
    unit: 1,
    defaultCashSpreadRate: 2.0,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'SGD',
    name: '싱가포르 달러',
    unit: 1,
    defaultCashSpreadRate: 1.99,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'IDR',
    name: '인도네시아 루피아',
    unit: 100,
    defaultCashSpreadRate: 2.0,
    defaultTelegraphicSpreadRate: 1.0,
  },
  {
    code: 'HKD',
    name: '홍콩 달러',
    unit: 1,
    defaultCashSpreadRate: 1.75,
    defaultTelegraphicSpreadRate: 1.0,
  },
]

export const CURRENCY_OPTIONS = CURRENCY_CONFIGS.map((currency) => ({
  value: currency.code,
  label: `${currency.code} (${currency.name})`,
}))

export function getCurrencyConfig(currencyCode: CurrencyCode): CurrencyConfig {
  const config = CURRENCY_CONFIGS.find((currency) => currency.code === currencyCode)

  if (!config) {
    throw new Error('통화를 선택해주세요.')
  }

  return config
}

export function isHundredUnitCurrency(currencyCode: CurrencyCode): boolean {
  return getCurrencyConfig(currencyCode).unit === 100
}

export function formatCurrencyUnitLabel(currencyCode: CurrencyCode): string {
  const { code, unit } = getCurrencyConfig(currencyCode)

  if (unit === 100) {
    if (code === 'JPY') {
      return '100엔당'
    }

    if (code === 'IDR') {
      return '100루피아당'
    }

    return '100단위당'
  }

  return '1단위당'
}
