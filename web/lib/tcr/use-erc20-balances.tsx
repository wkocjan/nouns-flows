import { Address, erc20Abi } from "viem"
import { useReadContracts } from "wagmi"

export function useERC20Balances(contracts: Address[], owner: Address | undefined) {
  const { data, refetch } = useReadContracts({
    contracts: contracts.map((contract) => ({
      abi: erc20Abi,
      address: contract,
      functionName: "balanceOf",
      args: [owner!!],
    })),
    query: { enabled: !!owner },
  })

  const balances = data?.map((balance) => BigInt(balance.result || 0)) || []

  return {
    balances,
    refetch,
  }
}
