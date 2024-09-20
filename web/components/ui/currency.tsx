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
        maximumFractionDigits: 0,
      }).format(Number(amount))}
    </Component>
  )
}
