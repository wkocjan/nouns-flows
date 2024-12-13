import { Context } from "ponder:registry"
import { formatEther, getAddress } from "viem"

export async function getTotalEarned(context: Context, contract: string, recipient: string) {
  const totalEarned = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getTotalReceivedByMember",
    args: [getAddress(recipient)],
  })

  return formatEther(totalEarned)
}
