"use client"

import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useUserGrants } from "./use-user-grants"

export const RecipientPopover = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()
  const { grants } = useUserGrants(address)

  useEffect(() => {
    setIsVisible(!!address && grants.length > 0)
  }, [address, grants])

  if (!isVisible) return null

  const yearlyEarnings = 12 * grants.reduce((acc, grant) => acc + Number(grant.monthlyFlowRate), 0)

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(21)}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="md:w-[440px]" collisionPadding={32}>
        <div>
          <p className="text-sm text-muted-foreground">
            You&apos;re earning{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(yearlyEarnings)}{" "}
            per year.
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
                  <Link href={`/grants/${grant.id}`} className="truncate text-sm hover:underline">
                    {grant.title}
                  </Link>
                </div>
                <div className="text-center text-sm">${grant.totalEarned}</div>
                <div className="text-center text-sm">$0</div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
