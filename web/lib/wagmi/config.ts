import { createConfig } from "@privy-io/wagmi"
import { webSocket } from "wagmi"
import { base, baseSepolia, Chain, mainnet } from "wagmi/chains"

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

export const chains = [base, baseSepolia, mainnet] satisfies Chain[]

export type SupportedChainId = (typeof chains)[number]["id"]

export const config = createConfig({
  chains: chains as any,
  transports: {
    [base.id]: webSocket(
      `wss://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
    [baseSepolia.id]: webSocket(
      `wss://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
    [mainnet.id]: webSocket(
      `wss://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
    ),
  },

  batch: { multicall: { wait: 32, batchSize: 2048 } },
})
