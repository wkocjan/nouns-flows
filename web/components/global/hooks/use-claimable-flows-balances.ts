import { useAccount } from "wagmi"
import { getClaimableBalances } from "./get-claimable-balance"
import useSWR from "swr"
import { formatEther } from "viem"

export const useClaimableFlowsBalances = (contracts: `0x${string}`[]) => {
  const { address } = useAccount()

  const { data, ...rest } = useSWR(address ? `${address}_claimable_flows_balances` : null, () =>
    getClaimableBalances(contracts, address!!.toLowerCase()),
  )

  return {
    totalBalance: data || BigInt(0),
    ...rest,
  }
}
