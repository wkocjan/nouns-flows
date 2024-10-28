import { HighlightInit } from "@highlight-run/next/client"

export default function Highlight() {
  return (
    <HighlightInit
      projectId={"ldw234kd"}
      serviceName="nouns-flows"
      tracingOrigins
      networkRecording={{
        enabled: true,
        recordHeadersAndBody: true,
        urlBlocklist: [],
      }}
    />
  )
}
