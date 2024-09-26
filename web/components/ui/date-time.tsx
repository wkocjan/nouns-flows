"use client"

import { HTMLProps } from "react"

interface DateProps extends Omit<HTMLProps<HTMLTimeElement>, "dateTime"> {
  date: Date
  locale?: Intl.LocalesArgument
  options?: Intl.DateTimeFormatOptions
  relative?: boolean
}

function getRelativeTime(date: Date, locale: Intl.LocalesArgument = "en-US") {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  const absDiff = Math.abs(diff)
  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const sign = diff >= 0 ? 1 : -1

  if (days !== 0) return formatter.format(sign * days, "day")
  if (hours !== 0) return formatter.format(sign * hours, "hour")
  if (minutes !== 0) return formatter.format(sign * minutes, "minute")
  return formatter.format(sign * seconds, "second")
}

export function DateTime({
  date,
  locale = "en-US",
  options,
  relative = false,
  ...rest
}: DateProps) {
  const displayText = relative
    ? getRelativeTime(date, locale)
    : date.toLocaleString(locale, options)

  return (
    <time dateTime={date.toISOString()} title={date.toString()} suppressHydrationWarning {...rest}>
      {displayText}
    </time>
  )
}
