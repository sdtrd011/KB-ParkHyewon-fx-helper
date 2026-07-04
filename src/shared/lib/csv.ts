const UTF8_BOM = '\uFEFF'

function escapeCsvCell(value: string | number): string {
  const cell = String(value)

  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`
  }

  return cell
}

export function createCsvContent(
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]

  return `${UTF8_BOM}${lines.join('\n')}`
}

export function downloadCsv(filename: string, content: string): void {
  if (typeof document === 'undefined') {
    return
  }

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
