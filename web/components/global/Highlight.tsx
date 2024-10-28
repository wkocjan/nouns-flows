import { HighlightInit } from "@highlight-run/next/client"

export default function Highlight() {
  return (
    <HighlightInit
      projectId={process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID}
      serviceName="nouns-flows"
      tracingOrigins
      excludedHostnames={["localhost"]}
      networkRecording={{
        enabled: true,
        recordHeadersAndBody: true,
        urlBlocklist: [],
      }}
    />
  )
}
