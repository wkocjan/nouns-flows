import database, { getCacheStrategy } from "@/lib/database/edge"

export const getPool = async () => {
  return await database.grant.findFirstOrThrow({
    where: { isTopLevel: 1, isFlow: 1 },
    include: { subgrants: true },
    ...getCacheStrategy(120),
  })
}
