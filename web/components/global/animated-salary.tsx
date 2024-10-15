"use client"

import { useEffect, useState } from "react"
import { AnimatedNumber } from "./animated-number"

export function AnimatedSalary({ value, monthlyRate }: { value: number; monthlyRate: number }) {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValue((prev) => prev + monthlyRate / 60 / 60 / 24)
    }, 1000)
    return () => clearInterval(interval)
  }, [monthlyRate])

  console.log({ currentValue })

  return <AnimatedNumber value={currentValue} />
}
