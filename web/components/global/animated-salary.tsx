"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useState } from "react"

interface Props {
  value: number | string
  monthlyRate: number | string
}

export function AnimatedSalary({ value, monthlyRate }: Props) {
  const [currentValue, setCurrentValue] = useState(Number(value))

  useEffect(() => {
    setCurrentValue(Number(value))
  }, [value])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue((prev) => prev + Number(monthlyRate) / 60 / 60 / 24)
    }, 1000)
    return () => clearInterval(interval)
  }, [monthlyRate])

  const fractionDigits = getCurrencyFractionDigits(Number(value))

  return (
    <NumberFlow
      value={currentValue}
      format={{
        currency: "USD",
        style: "currency",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }}
      locales="en-US"
      trend="increasing"
    />
  )
}

export function getCurrencyFractionDigits(amount: number) {
  if (amount < 10) return 4
  if (amount < 1000) return 3
  return 2
}
