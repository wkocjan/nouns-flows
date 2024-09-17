import { getDefaultConfig } from "connectkit"
import { createConfig, webSocket } from "wagmi"
import { base, baseSepolia, mainnet } from "wagmi/chains"

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

const chains = [base, baseSepolia, mainnet] as const

export type SupportedChainId = (typeof chains)[number]["id"]

export const config = createConfig(
  getDefaultConfig({
    chains,
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

    walletConnectProjectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,

    appName: "Nouns Flows",
    appDescription: "",
    appUrl: "https://flows.wtf/",
    appIcon: "https://flows.wtf/noggles.svg",
  }),
)
