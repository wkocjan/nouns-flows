"use client"

import { WithdrawSalaryButton } from "@/components/global/withdraw-salary-button"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

interface Props {
  recipient: string
  pools: `0x${string}`[]
  flow: `0x${string}`
}

export const ClaimableBalance = (props: Props) => {
  const { recipient, pools, flow } = props
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    setIsVisible(address?.toLowerCase() === recipient.toLowerCase())
  }, [address, recipient])

  if (!isVisible) return null

  return (
    <div>
      <h4 className="text-[13px] tracking-tight text-muted-foreground">Claimable</h4>
      <div className="-ml-3.5 -mt-0.5">
        <WithdrawSalaryButton flow={flow} size="default" pools={pools} />
      </div>
    </div>
  )
}
