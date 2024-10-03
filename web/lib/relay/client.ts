import {
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  convertViemChainToRelayChain,
  createClient,
} from "@reservoir0x/relay-sdk"
import { Chain, arbitrum, base, baseSepolia, mainnet, optimism } from "viem/chains"

export function createRelayClient(chainId: number) {
  const isTestnet = [baseSepolia.id].includes(chainId as any)

  const chains: Chain[] = [mainnet, base, optimism, arbitrum]

  if (isTestnet) {
    chains.push(baseSepolia)
  }

  return createClient({
    baseApiUrl: isTestnet ? TESTNET_RELAY_API : MAINNET_RELAY_API,
    source: "flows.wtf",
    chains: chains.map((chain) => convertViemChainToRelayChain(chain)),
  })
}
