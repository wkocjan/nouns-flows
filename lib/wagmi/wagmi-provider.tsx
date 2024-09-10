"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider } from "connectkit"
import { useTheme } from "next-themes"
import { PropsWithChildren } from "react"
import { WagmiProvider } from "wagmi"
import { config } from "./config"

const queryClient = new QueryClient()

export default function Wagmi({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          mode={resolvedTheme === "dark" ? "dark" : "light"}
          customTheme={{
            "--ck-font-family": "var(--font-mono)",
            "--ck-border-radius": "var(--radius)",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
