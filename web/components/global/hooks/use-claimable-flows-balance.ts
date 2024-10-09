import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"
import { nounsFlowAbi } from "@/lib/abis"

export const useClaimableFlowsBalance = (contract: `0x${string}`) => {
  const { address } = useAccount()
  const chainId = base.id

  console.log({ contract })

  const { data: balance, isLoading } = useReadContract({
    address: contract,
    abi: nounsFlowAbi,
    chainId,
    functionName: "getClaimableBalance",
    args: address ? [address] : undefined,
  })

  console.log({ balance })

  return {
    balance: balance || BigInt(0),
    isLoading,
  }
}
