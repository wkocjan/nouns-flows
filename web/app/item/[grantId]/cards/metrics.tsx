interface Props {
  metrics: Array<{
    value: number
    label: string
  }>
}

export function Metrics(props: Props) {
  const { metrics } = props

  return (
    <div
      className="col-span-full grid gap-3"
      style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
    >
      {metrics.map(({ label, value }) => (
        <div key={label} className="rounded-xl border bg-card p-6">
          <div className="text-5xl font-bold">{value}</div>
          <div className="mt-2 text-sm">{label}</div>
        </div>
      ))}
    </div>
  )
}
