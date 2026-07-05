export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

export function roundToInteger(value: number): number {
  return Math.round(value)
}

export function percentToDecimal(percent: number): number {
  return percent / 100
}

export function parseNumber(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}
