"use client"

import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

interface Props {
  recipient: string
  claimableBalance: string
}

export const ClaimableBalance = (props: Props) => {
  const { recipient, claimableBalance } = props
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    setIsVisible(address?.toLowerCase() === recipient.toLowerCase())
  }, [address, recipient])

  if (!isVisible) return null

  const canClaim = Number(claimableBalance) > 0

  return (
    <div>
      <h4 className="text-[13px] tracking-tight text-muted-foreground">Claimable</h4>
      <p className="mt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button disabled={!canClaim} className="group flex items-center">
              <Currency className="text-lg font-medium">{claimableBalance}</Currency>
              <DownloadIcon className="ml-1 size-3.5 group-hover:text-primary" />
              <span className="sr-only">Claim</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{canClaim ? "Claim your balance" : "No balance to claim"}</TooltipContent>
        </Tooltip>
      </p>
    </div>
  )
}
