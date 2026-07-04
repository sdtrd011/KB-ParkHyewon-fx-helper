import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <section
      className={['rounded-lg border border-slate-200 bg-white p-6 shadow-sm', className].join(
        ' ',
      )}
      {...props}
    >
      {title && <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>}
      {children}
    </section>
  )
}
