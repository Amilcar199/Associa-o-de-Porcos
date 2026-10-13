'use client'

export interface ChartSlice {
  label: string
  value: number
  color: string
}

export function DonutChart({ slices, emptyLabel = 'Sem dados' }: { slices: ChartSlice[]; emptyLabel?: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={radius} fill="none" className="stroke-gray-200 dark:stroke-slate-700" strokeWidth="14" />
          {total > 0 && slices.map((slice) => {
            const length = (slice.value / total) * circumference
            const dash = `${length} ${circumference - length}`
            const element = (
              <circle
                key={slice.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            )
            offset += length
            return element
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-500">total</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {total === 0 ? (
          <li className="text-sm text-gray-500">{emptyLabel}</li>
        ) : slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="font-semibold text-gray-900">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function BarChart({ slices, emptyLabel = 'Sem dados' }: { slices: ChartSlice[]; emptyLabel?: string }) {
  const max = Math.max(...slices.map((slice) => slice.value), 0)
  if (max === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">{emptyLabel}</p>
  }

  return (
    <div className="space-y-3">
      {slices.map((slice) => (
        <div key={slice.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-gray-600">{slice.label}</span>
            <span className="font-semibold text-gray-900">{slice.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max((slice.value / max) * 100, slice.value > 0 ? 6 : 0)}%`, backgroundColor: slice.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
