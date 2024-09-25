"use client"

import { HTMLProps } from "react"

interface DateProps extends Omit<HTMLProps<HTMLTimeElement>, "dateTime"> {
  date: Date
  locale?: Intl.LocalesArgument
  options?: Intl.DateTimeFormatOptions
}

export function DateTime({ date, locale = "en-US", options, ...rest }: DateProps) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning {...rest}>
      {date.toLocaleString(locale, options)}
    </time>
  )
}
