import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { erc20VotesArbitratorImplAbi } from "@/lib/abis"
import { useAccount } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { getEthAddress } from "@/lib/utils"

export const useWithdrawVoterRewards = (arbitratorAddress: `0x${string}`) => {
  const { address } = useAccount()
  const chainId = base.id

  const { prepareWallet, writeContract, isLoading, toastId } = useContractTransaction({
    chainId,
    success: "Rewards withdrawn successfully!",
    onSuccess: (hash) => {
      // Handle successful withdrawal here if needed
      console.log("Withdrawal transaction hash:", hash)
    },
  })

  const withdrawRewards = async (disputeId: bigint, round: bigint) => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    try {
      await prepareWallet()

      writeContract({
        account: address,
        address: getEthAddress(arbitratorAddress),
        abi: erc20VotesArbitratorImplAbi,
        functionName: "withdrawVoterRewards",
        args: [disputeId, round, address],
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    withdrawRewards,
    isLoading,
  }
}
