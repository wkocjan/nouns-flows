import { rewardPoolAbi, rewardPoolImplAbi } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"

export const useClaimablePoolBalance = (pool: `0x${string}`) => {
  const { address } = useAccount()
  const chainId = base.id

  const { data: balance, isLoading } = useReadContract({
    address: pool,
    abi: rewardPoolImplAbi,
    chainId,
    functionName: "getClaimableBalanceNow",
    args: address ? [address] : undefined,
  })

  return {
    balance,
    isLoading,
  }
}
