import MarkdownJsx, { MarkdownToJSX } from "markdown-to-jsx"
import { Fragment } from "react"

interface Props {
  children: string
  options?: MarkdownToJSX.Options
}

export const Markdown = (props: Props) => {
  const { children = "", options } = props

  return (
    <MarkdownJsx
      options={{
        overrides: {
          a: { props: { target: "_blank", className: "underline break-all" } },
          ul: { props: { className: "list-disc list-inside" } },
          li: { props: { className: "[&>*]:inline-block" } },
          h1: { props: { className: "text-[1.4em] font-semibold" } },
          h2: { props: { className: "text-[1.2em] font-semibold" } },
          h3: { props: { className: "font-semibold" } },
        },
        wrapper: Fragment,
        ...options,
      }}
    >
      {children}
    </MarkdownJsx>
  )
}
