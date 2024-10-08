import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { superTokenAbi } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { useClaimablePoolBalance } from "./use-claimable-pool-balance"

export const useWithdrawSuperToken = (superToken: `0x${string}`, pool: `0x${string}`) => {
  const { address } = useAccount()
  const chainId = base.id

  const { data: balance } = useReadContract({
    address: superToken,
    abi: superTokenAbi,
    chainId,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { balance: poolBalance } = useClaimablePoolBalance(pool)

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Earnings withdrawn successfully!",
    onSuccess: (hash) => {
      // Handle successful withdrawal here if needed
      console.log("Withdrawal transaction hash:", hash)
    },
  })

  const withdraw = async (amount: bigint) => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    try {
      await prepareWallet()

      writeContract({
        account: address,
        address: superToken,
        abi: superTokenAbi,
        functionName: "downgradeTo",
        args: [address, amount],
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    withdraw,
    totalBalance: balance,
    poolBalance: poolBalance || BigInt(0),
    isLoading,
  }
}
