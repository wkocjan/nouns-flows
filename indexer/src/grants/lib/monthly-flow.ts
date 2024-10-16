import { Context } from "@/generated"
import { formatEther, getAddress } from "viem"

export async function getMonthlyIncomingFlowRate(
  context: Context,
  parentContract: string,
  recipient: string
) {
  const flowRate = await context.client.readContract({
    address: getAddress(parentContract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getMemberTotalFlowRate",
    args: [getAddress(recipient)],
  })

  return formatEther(flowRate * BigInt(60 * 60 * 24 * 30))
}

export async function getMonthlyOutgoingFlowRate(context: Context, contract: string) {
  const flowRate = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getTotalFlowRate",
  })

  return formatEther(flowRate * BigInt(60 * 60 * 24 * 30))
}

export async function getMonthlyRewardPoolFlowRate(context: Context, contract: string) {
  const flowRate = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getManagerRewardPoolFlowRate",
  })

  return formatEther(flowRate * BigInt(60 * 60 * 24 * 30))
}
