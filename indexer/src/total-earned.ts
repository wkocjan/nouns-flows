import { ponder, Schema, type Context, type Event } from "@/generated";
import { formatEther, getAddress } from "viem";

ponder.on("TotalEarned:block", async (params) => {
  const { event, context } = params;

  const { items } = await context.db.Grant.findMany({
    limit: 10,
    orderBy: { updatedAt: "asc" },
    where: { isRemoved: false },
  });

  await Promise.all(
    items.map(async (grant) => updateTotalEarned(context, event, grant))
  );
});

async function updateTotalEarned(
  context: Context<"TotalEarned:block">,
  event: Event<"TotalEarned:block">,
  grant: Schema["Grant"]
) {
  const { id, parent, recipient } = grant;
  const totalEarned = await getTotalEarned(context, parent, recipient);

  await context.db.Grant.update({
    id,
    data: { totalEarned, updatedAt: Number(event.block.timestamp) },
  });
}

async function getTotalEarned(
  context: Context<"TotalEarned:block">,
  contract: string,
  recipient: string
) {
  const totalEarned = await context.client.readContract({
    address: getAddress(contract),
    abi: context.contracts.NounsFlow.abi,
    functionName: "getTotalReceivedByMember",
    args: [getAddress(recipient)],
  });

  return formatEther(totalEarned);
}
