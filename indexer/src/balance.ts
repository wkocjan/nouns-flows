import { ponder } from "@/generated";
import { getClaimableBalance } from "./lib/claimable-balance";
import { getMonthlyFlowRate } from "./lib/monthly-flow";
import { getTotalEarned } from "./lib/total-earned";

ponder.on("Balance:block", async (params) => {
  const { event, context } = params;

  const { items } = await context.db.Grant.findMany({
    limit: 15,
    orderBy: { updatedAt: "asc" },
    where: { isRemoved: false },
  });

  for (const grant of items) {
    const [totalEarned, monthlyFlowRate, claimableBalance] = await Promise.all([
      getTotalEarned(context, grant.parent, grant.recipient),
      getMonthlyFlowRate(context, grant.parent, grant.recipient),
      getClaimableBalance(context, grant.parent, grant.recipient),
    ]);

    await context.db.Grant.update({
      id: grant.id,
      data: {
        totalEarned,
        monthlyFlowRate,
        claimableBalance,
        updatedAt: Number(event.block.timestamp),
      },
    });
  }
});
