import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Address, erc20Abi } from "viem"
import { base } from "viem/chains"
import { useAccount, useReadContract } from "wagmi"

export function useTcrToken(contract: Address, spender: Address) {
  const { address: owner } = useAccount()

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: contract,
    functionName: "allowance",
    args: [owner!!, spender],
    query: { enabled: !!owner },
  })

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: contract,
    functionName: "balanceOf",
    args: [owner!!],
    query: { enabled: !!owner },
  })

  const { prepareWallet, writeContract, isLoading, isConfirmed } = useContractTransaction({
    chainId: base.id,
    onSuccess: () => refetchAllowance(),
  })

  return {
    allowance: allowance || BigInt(0),
    balance: balance || BigInt(0),
    approve: async (amount: bigint) => {
      await prepareWallet()
      writeContract({
        abi: erc20Abi,
        address: contract,
        functionName: "approve",
        args: [spender, amount + amount / BigInt(5)], // ToDo: Temp fix 20%
      })
    },
    isApproving: isLoading,
    isApproved: isConfirmed,
  }
}
