export interface KoreaEximExchangeRateItem {
  result: number
  cur_unit: string
  cur_nm?: string
  ttb?: string
  tts?: string
  deal_bas_r?: string
  bkpr?: string
}

export interface KoreaEximExchangeRatesResult {
  searchDate: string
  items: KoreaEximExchangeRateItem[]
}
