"use client"

import { Draft } from "@prisma/flows"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

const rocketman = "0x289715ffbb2f4b482e2917d2f183feab564ec84f"

export function useCanManageDraft(draft: Draft) {
  const { address } = useAccount()
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    setCanManage(
      !!address &&
        (draft.users.some((user) => user.toLowerCase() === address.toLowerCase()) ||
          address.toLowerCase() === rocketman.toLowerCase()),
    )
  }, [address, draft.users])

  return canManage
}
