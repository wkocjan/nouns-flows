"use client"

import { WithdrawButton } from "@/components/global/withdraw-button"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

interface Props {
  recipient: string
  superToken: `0x${string}`
  pool: `0x${string}`
}

export const ClaimableBalance = (props: Props) => {
  const { recipient, superToken, pool } = props
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    setIsVisible(address?.toLowerCase() === recipient.toLowerCase())
  }, [address, recipient])

  if (!isVisible) return null

  return (
    <div>
      <h4 className="text-[13px] tracking-tight text-muted-foreground">Claimable</h4>
      <WithdrawButton size="sm" superToken={superToken} pool={pool} />
    </div>
  )
}
