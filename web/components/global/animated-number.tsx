// animated-number.tsx

"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

export function AnimatedNumber({ value }: { value: number }) {
  let spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
  let display = useTransform(spring, (current) => current.toFixed(7).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}
