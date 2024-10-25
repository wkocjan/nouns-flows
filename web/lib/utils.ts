import { Grant } from "@prisma/client"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { base, baseSepolia, mainnet } from "viem/chains"
import { nounsTokenAddress } from "./abis"
import { NOUNS_TOKEN } from "./config"
import { Status } from "./enums"
import { getPinataUrl } from "./pinata/get-file-url"
import { SupportedChainId } from "./wagmi/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getShortEthAddress(address?: string | null) {
  if (!address || address.length < 10) return ""

  return `${address.substring(0, 5)}...${address.substring(address.length - 3)}`
}

export function explorerUrl(address: string, chainId: number, type: "tx" | "address" = "tx") {
  const explorerDomain: Record<SupportedChainId, string> = {
    [mainnet.id]: "etherscan.io",
    [base.id]: "basescan.org",
    [baseSepolia.id]: "sepolia.basescan.org/",
  }

  if (!(chainId in explorerDomain)) throw new Error("Unsupported chain")

  return `https://${explorerDomain[chainId as SupportedChainId]}/${type}/${address}`
}

export function getIpfsUrl(url: string, gateway: "pinata" | "ipfs" = "ipfs") {
  if (url.startsWith("http")) return url

  const hash = url.replace("ipfs://", "")

  if (gateway === "pinata") return getPinataUrl(url)

  return `https://ipfs.io/ipfs/${hash}`
}

export function getEthAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid Ethereum address")
  }

  return address.toLowerCase() as `0x${string}`
}

export function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function openseaNftUrl(contract: string, tokenId: string, chainId: number): string {
  let url = ""

  switch (chainId) {
    case baseSepolia.id:
      url = "https://testnets.opensea.io/assets/base-sepolia"
      break
    case base.id:
      url = "https://opensea.io/assets/base"
      break
    default:
      url = "https://opensea.io/assets"
  }

  return `${url}/${contract}/${tokenId}`
}

export function isGrantApproved(grant: Grant) {
  const { status } = grant
  return status === Status.Registered || status === Status.ClearingRequested
}

export function isGrantChallenged(grant: Grant) {
  const { status, isDisputed, isResolved } = grant

  if (status === Status.ClearingRequested) return true
  return status === Status.RegistrationRequested && isDisputed === 1 && isResolved === 0
}

export function isGrantAwaiting(grant: Grant) {
  return grant.status === Status.RegistrationRequested
}

export function usesTestNounsToken() {
  return NOUNS_TOKEN.toLowerCase() !== nounsTokenAddress[1].toLowerCase()
}
