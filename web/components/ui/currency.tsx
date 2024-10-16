import { PropsWithChildren } from "react"

interface Props {
  as?: "span" | "div"
  className?: string
}

export const Currency = (props: PropsWithChildren<Props>) => {
  const { children: amount, as: Component = "span", ...rest } = props

  return (
    <Component {...rest}>
      {Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: getCurrencyFractionDigits(Number(amount)),
      }).format(Number(amount))}
    </Component>
  )
}

function getCurrencyFractionDigits(amount: number) {
  if (amount < 0.001) return 3
  if (amount < 10) return 2
  return 0
}
