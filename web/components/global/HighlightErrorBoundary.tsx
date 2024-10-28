// components/error-boundary.tsx
"use client"

import { ErrorBoundary } from "@highlight-run/next/client"

export function HighlightErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary showDialog>{children}</ErrorBoundary>
}
