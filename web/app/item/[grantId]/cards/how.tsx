import { Icon } from "@/components/ui/icon"
import { Gradient, GradientCard } from "./gradient-card"

interface Props {
  gradient: Gradient
  icon: string
  text: string
}

export function HowCard(props: Props) {
  const { gradient, icon, text } = props

  return (
    <GradientCard gradient={gradient} className="h-3/5 p-6">
      <div className="flex h-full flex-col items-start justify-between">
        <Icon name={icon} className="size-6" />
        <p className="mt-2 text-sm leading-normal">{text}</p>
      </div>
    </GradientCard>
  )
}
