"use client"

import { getEthAddress } from "@/lib/utils"
import useSWR from "swr"
import { getFlowsForParent } from "../database/queries/flow"

export function useFlowsForParent(parent: string | undefined) {
  const { data, ...rest } = useSWR(parent ? `${parent}_grants` : null, () =>
    getFlowsForParent(getEthAddress(parent!!)),
  )

  return {
    grants: data || [],
    ...rest,
  }
}
