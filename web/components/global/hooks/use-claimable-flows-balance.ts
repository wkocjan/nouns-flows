import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"
import { nounsFlowImplAbi } from "@/lib/abis"

const chainId = base.id

export const useClaimableFlowsBalance = (contract: `0x${string}`) => {
  const { address } = useAccount()

  const { data: balance, isLoading } = useReadContract({
    address: contract,
    abi: nounsFlowImplAbi,
    chainId,
    functionName: "getClaimableBalance",
    args: address ? [address] : undefined,
  })

  return {
    balance: balance || BigInt(0),
    isLoading,
  }
}
