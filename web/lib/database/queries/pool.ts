import database from "@/lib/database"

export const getPool = async () => {
  return await database.grant.findFirstOrThrow({
    where: { isTopLevel: 1, isFlow: 1 },
    include: { subgrants: true },
    cacheStrategy: { swr: 120 },
  })
}
