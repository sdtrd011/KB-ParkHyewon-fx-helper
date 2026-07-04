export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

export function roundToInteger(value: number): number {
  return Math.round(value)
}

export function percentToDecimal(percent: number): number {
  return percent / 100
}
