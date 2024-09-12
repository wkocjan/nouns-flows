import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { base, baseSepolia, mainnet } from "viem/chains"
import { getPinataUrl } from "./pinata/get-file-url"
import { SupportedChainId } from "./wagmi/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getShortEthAddress(address?: string | null) {
  if (!address || address.length < 10) return ""

  return `${address.substring(0, 5)}...${address.substring(address.length - 3)}`
}

export function explorerUrl(
  address: string,
  chainId: number,
  type: "tx" | "address" = "tx",
) {
  const explorerDomain: Record<SupportedChainId, string> = {
    [mainnet.id]: "etherscan.io",
    [base.id]: "basescan.org",
    [baseSepolia.id]: "sepolia.basescan.org/",
  }

  if (!(chainId in explorerDomain)) throw new Error("Unsupported chain")

  return `https://${explorerDomain[chainId as SupportedChainId]}/${type}/${address}`
}

export function getIpfsUrl(file: string, gateway: "pinata" | "ipfs" = "ipfs") {
  const hash = file.replace("ipfs://", "")

  if (gateway === "pinata") return getPinataUrl(file)

  return `https://ipfs.io/ipfs/${hash}`
}

export function getEthAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid Ethereum address")
  }

  return address.toLowerCase() as `0x${string}`
}
