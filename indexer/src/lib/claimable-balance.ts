import { Context } from "@/generated";
import { formatEther } from "viem";

export async function getClaimableBalance(
  context: Context,
  contract: string,
  recipient: string
) {
  // const claimableBalance = await context.client.readContract({
  //   address: getAddress(contract),
  //   abi: context.contracts.NounsFlow.abi,
  //   functionName: "getClaimableBalanceNow",
  //   args: [getAddress(recipient)],
  // });

  const claimableBalance = BigInt(50 * 1e18);

  return formatEther(claimableBalance);
}
