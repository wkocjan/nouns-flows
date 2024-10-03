"use server"

import { NOUNS_FLOW } from "@/lib/config"
import database from "@/lib/database"
import { unstable_cache } from "next/cache"

export const getPool = unstable_cache(
  async () => {
    return await database.grant.findFirstOrThrow({ where: { isTopLevel: 1, isFlow: 1 } })
  },
  [NOUNS_FLOW],
  { revalidate: 60 },
)
