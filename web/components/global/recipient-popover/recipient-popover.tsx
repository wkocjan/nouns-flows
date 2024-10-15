"use client"

import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { WithdrawSalaryButton } from "../withdraw-salary-button"
import { useUserGrants } from "./use-user-grants"
import { useClaimableFlowsBalances } from "../hooks/use-claimable-flows-balances"

export const RecipientPopover = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()
  const { grants, claimableBalance, earnings } = useUserGrants(address)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { totalBalance } = useClaimableFlowsBalances(
    grants.map((grant) => getEthAddress(grant.parentContract)),
  )

  useEffect(() => {
    setIsVisible(!!address && grants.length > 0)
  }, [address, grants])

  if (!isVisible) return null

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs">
          {/* Pull from contracts directly for more up to date balance */}
          <Currency>{totalBalance || claimableBalance}</Currency>
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[480px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <div>
          <p className="text-sm text-muted-foreground">
            You&apos;re earning <Currency>{earnings.yearly}</Currency> per year.
          </p>
          <div className="mt-4">
            <div className="mb-2 grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
              <div className="col-start-3 text-center">Earned</div>
              <div className="text-center">Claimable</div>
            </div>
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="grid grid-cols-4 items-center gap-2 border-t border-border py-2"
              >
                <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
                  <Image
                    src={getIpfsUrl(grant.image)}
                    alt={grant.title}
                    className="size-6 flex-shrink-0 rounded-full object-cover"
                    width={24}
                    height={24}
                  />
                  <Link
                    href={`/grant/${grant.id}`}
                    className="truncate text-sm hover:underline"
                    onClick={() => closeRef.current?.click()}
                  >
                    {grant.title}
                  </Link>
                </div>
                <Currency as="div" className="text-center text-sm font-medium">
                  {grant.totalEarned}
                </Currency>
                <div className="flex items-center justify-center">
                  <WithdrawSalaryButton
                    flow={getEthAddress(grant.parentContract)}
                    pools={[grant.flow.baselinePool, grant.flow.bonusPool].map((pool) =>
                      getEthAddress(pool),
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
