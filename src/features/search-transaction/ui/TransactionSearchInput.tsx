import { Input } from '@/shared/ui'

interface TransactionSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function TransactionSearchInput({ value, onChange }: TransactionSearchInputProps) {
  return (
    <Input
      label="검색"
      name="search"
      placeholder="고객명, 통화, 메모로 검색"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
