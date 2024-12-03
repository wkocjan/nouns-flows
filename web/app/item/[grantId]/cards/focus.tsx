import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  text: string
}

export function FocusCard(props: Props) {
  const { gradient, text } = props

  return (
    <GradientCard gradient={gradient} className="h-2/5 p-6">
      <div className="flex h-full flex-col justify-between">
        <div className="text-[11px] uppercase tracking-wider opacity-50">Current Focus</div>
        <p className="mt-2 text-sm leading-normal">{text}</p>
      </div>
    </GradientCard>
  )
}
