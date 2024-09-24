import { Context } from "@/generated"
import { formatEther, getAddress } from "viem"

export async function getClaimableBalance(context: Context, contract: string, recipient: string) {
  const claimableBalance = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getClaimableBalance",
    args: [getAddress(recipient)],
  })

  return formatEther(claimableBalance)
}
