import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { gdav1ForwarderAbi, gdav1ForwarderAddress } from "@/lib/abis"
import { useAccount, useReadContract } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export const useConnectSuperfluidDistributionPool = (rewardPoolAddress: `0x${string}`) => {
  const { address } = useAccount()
  const router = useRouter()
  const chainId = base.id

  const {
    data: isConnected,
    refetch,
    isLoading,
  } = useReadContract({
    address: gdav1ForwarderAddress[chainId],
    abi: gdav1ForwarderAbi,
    functionName: "isMemberConnected",
    args: address ? [rewardPoolAddress, address] : undefined,
  })

  const {
    prepareWallet,
    writeContract,
    isLoading: isConnecting,
    toastId,
  } = useContractTransaction({
    chainId,
    success: "Successfully connected to Superfluid pool!",
    onSuccess: async (hash) => {
      await refetch()
      router.refresh()
    },
  })

  const connect = async () => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    try {
      await prepareWallet()

      writeContract({
        account: address,
        address: gdav1ForwarderAddress[base.id],
        abi: gdav1ForwarderAbi,
        functionName: "connectPool",
        args: [rewardPoolAddress, "0x"],
      })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
  }

  return {
    isLoading,
    connect,
    isConnected,
    isConnecting,
  }
}
