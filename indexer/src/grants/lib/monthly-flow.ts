import { Context } from "@/generated"
import { formatEther, getAddress } from "viem"

export async function getMonthlyFlowRate(
  context: Context,
  contract: string,
  recipient: string,
  isTopLevel: boolean
) {
  const flowRate = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: isTopLevel ? "getTotalFlowRate" : "getMemberTotalFlowRate",
    args: isTopLevel ? undefined : [getAddress(recipient)],
  })

  return formatEther(flowRate * BigInt(60 * 60 * 24 * 30))
}
