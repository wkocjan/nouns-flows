import { getDefaultConfig } from "connectkit"
import { createConfig, http } from "wagmi"
import { base, baseSepolia, mainnet } from "wagmi/chains"

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig(
  getDefaultConfig({
    chains: [base, baseSepolia, mainnet],
    transports: {
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    },

    walletConnectProjectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,

    appName: "Nouns Flows",
    appDescription: "",
    appUrl: "https://nouns-grants.vercel.app/",
    appIcon: "https://nouns-grants.vercel.app/noggles.svg",
  }),
)
