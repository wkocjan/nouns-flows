import { Context } from "@/generated";
import { formatEther, getAddress } from "viem";

export async function getMonthlyFlowRate(
  context: Context,
  contract: string,
  recipient: string
) {
  const memberTotalFlowRate = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getMemberTotalFlowRate",
    args: [getAddress(recipient)],
  });

  return formatEther(memberTotalFlowRate * BigInt(60 * 60 * 24 * 30));
}
