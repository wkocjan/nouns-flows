"use client"

import { Draft } from "@prisma/client"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

export function useCanManageDraft(draft: Draft) {
  const { address } = useAccount()
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    setCanManage(!!address && draft.users.some((user) => user === address.toLowerCase()))
  }, [address, draft.users])

  return canManage
}