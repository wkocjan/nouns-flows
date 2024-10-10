import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { gdav1ForwarderAbi, gdav1ForwarderAddress, multicall3Abi } from "@/lib/abis"
import { useAccount, useReadContracts } from "wagmi"
import { base } from "viem/chains"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MULTICALL_ADDRESS } from "@/lib/config"
import { encodeAbiParameters } from "viem"

export const useConnectSuperfluidDistributionPool = (pools: `0x${string}`[]) => {
  const { address } = useAccount()
  const router = useRouter()
  const chainId = base.id

  const contracts = pools.map((pool) => ({
    address: gdav1ForwarderAddress[chainId] as `0x${string}`,
    abi: gdav1ForwarderAbi,
    chainId,
    functionName: "isMemberConnected",
    args: address ? [pool, address] : undefined,
  }))

  const { data: isConnectedResults, refetch, isLoading } = useReadContracts({ contracts })

  const isConnected = isConnectedResults?.reduce((acc, result) => {
    if (!result.result) {
      acc = false
    }
    return acc
  }, true)

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

      const multicalls = pools.map((pool) => ({
        target: gdav1ForwarderAddress[base.id] as `0x${string}`,
        callData: encodeAbiParameters(
          [
            { name: "pool", type: "address" },
            { name: "userData", type: "bytes" },
          ],
          [pool, "0x"],
        ),
        allowFailure: true,
      }))

      console.log("Addresses used:")
      console.log("User address:", address)
      console.log("GDAv1Forwarder address:", gdav1ForwarderAddress[chainId])
      console.log("Multicall address:", MULTICALL_ADDRESS)
      console.log("Pool addresses:", pools)
      console.log("Multicalls:", multicalls)

      writeContract({
        account: address,
        address: MULTICALL_ADDRESS,
        abi: multicall3Abi,
        functionName: "aggregate3",
        args: [multicalls],
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
