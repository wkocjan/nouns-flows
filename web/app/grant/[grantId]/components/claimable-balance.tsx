"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { WithdrawSalaryButton } from "../../../../components/global/withdraw-salary-button"

interface Props {
  recipient: string
  superToken: `0x${string}`
  pool: `0x${string}`
  flow: `0x${string}`
}

export const ClaimableBalance = (props: Props) => {
  const { recipient, superToken, pool, flow } = props
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    setIsVisible(address?.toLowerCase() === recipient.toLowerCase())
  }, [address, recipient])

  if (!isVisible) return null

  return (
    <div>
      <h4 className="text-[13px] tracking-tight text-muted-foreground">Claimable</h4>
      <WithdrawSalaryButton flow={flow} size="sm" superToken={superToken} pool={pool} />
    </div>
  )
}
