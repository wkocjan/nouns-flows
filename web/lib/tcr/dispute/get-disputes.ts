"use server"

import database from "@/lib/database"

export async function getDisputes(grantId: string) {
  const disputes = await database.dispute.findMany({
    where: { grantId },
    orderBy: { votingEndTime: "desc" },
  })

  return disputes
}
