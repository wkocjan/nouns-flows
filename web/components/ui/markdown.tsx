import MarkdownJsx, { MarkdownToJSX } from "markdown-to-jsx"
import { Fragment } from "react"
import { VideoPlayer } from "./video-player"

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
          a: {
            props: {
              target: "_blank",
              className:
                "underline break-all hover:text-primary transition-colors underline-offset-4",
            },
            component: (props) => {
              const { href = "" } = props
              if (href.startsWith("https://stream.mux.com/") && href.endsWith(".m3u8")) {
                return (
                  <VideoPlayer
                    url={href}
                    controls
                    width="auto"
                    height="auto"
                    style={{
                      maxHeight: "90vh",
                      minWidth: "320px",
                      minHeight: "240px",
                      maxWidth: "100%",
                    }}
                  />
                )
              }
              return <a {...props} />
            },
          },
          ul: { props: { className: "list-disc list-inside" } },
          li: { props: { className: "[&>*]:inline-block leading-relaxed" } },
          h1: { props: { className: "text-[1.25em] font-medium tracking-tight" } },
          h2: { props: { className: "text-[1.15em] font-medium tracking-tight" } },
          h3: { props: { className: "font-medium tracking-tight" } },
          p: { props: { className: "leading-relaxed" } },
        },
        wrapper: Fragment,
        ...options,
      }}
    >
      {children}
    </MarkdownJsx>
  )
}
