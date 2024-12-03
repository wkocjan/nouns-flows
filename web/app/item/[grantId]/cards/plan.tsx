interface Props {
  plan: Array<{ title: string; description: string }>
}

export function Plan(props: Props) {
  const { plan } = props

  return (
    <>
      <div className="col-span-full mt-8">
        <h3 className="text-2xl font-medium">The plan</h3>
      </div>

      {plan.map(({ title, description }) => (
        <div
          key={title}
          className="col-span-4 flex gap-x-4 rounded-xl border bg-white/50 p-8 dark:bg-black/5"
        >
          <div className="text-base">
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
    </>
  )
}
