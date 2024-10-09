import { PropsWithChildren } from "react"

interface Props {
  as?: "span" | "div"
  className?: string
}

export const Currency = (props: PropsWithChildren<Props>) => {
  const { children: amount, as: Component = "span", ...rest } = props

  const amountNumber = Number(amount)
  let maximumFractionDigits = 2

  if (amountNumber < 0.001) {
    maximumFractionDigits = 4
  } else if (amountNumber < 10) {
    maximumFractionDigits = 2
  } else {
    maximumFractionDigits = 0
  }

  return (
    <Component {...rest}>
      {Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits,
      }).format(Number(amount))}
    </Component>
  )
}
