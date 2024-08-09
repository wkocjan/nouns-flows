import { getDefaultConfig } from "connectkit"
import { createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"

export const config = createConfig(
  getDefaultConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
      ),
    },

    walletConnectProjectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,

    appName: "Nouns Grants",
    appDescription: "",
    appUrl: "https://nouns-grants.vercel.app/",
    appIcon: "https://nouns-grants.vercel.app/noggles.svg",
  }),
)
