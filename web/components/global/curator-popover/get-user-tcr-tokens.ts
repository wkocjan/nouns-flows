"use server"

import database from "@/lib/database"
import { cache } from "react"

export const getUserTcrTokens = cache(async (address: `0x${string}`) => {
  if (!address) return []

  const tokens = await database.tokenHolder.findMany({
    where: { holder: address },
    orderBy: { amount: "desc" },
    include: {
      flow: {
        select: {
          id: true,
          title: true,
          image: true,
          subgrants: {
            select: {
              disputes: {
                select: {
                  appealPeriodEndTime: true,
                  isExecuted: true,
                },
              },
              isActive: true,
              isDisputed: true,
              isResolved: true,
              title: true,
              image: true,
              id: true,
              status: true,
              challengePeriodEndsAt: true,
            },
          },
        },
      },
    },
  })

  return tokens
})
