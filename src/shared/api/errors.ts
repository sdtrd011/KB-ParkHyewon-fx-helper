export class ExchangeRateDateNotAvailableError extends Error {
  readonly searchDate: string

  constructor(searchDate: string) {
    super('조회일 환율 데이터가 없습니다.')
    this.name = 'ExchangeRateDateNotAvailableError'
    this.searchDate = searchDate
  }
}
