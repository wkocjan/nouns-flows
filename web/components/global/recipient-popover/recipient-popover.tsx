"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getUserUpdatesChannel } from "@/lib/farcaster/get-user-updates-channel"
import { useServerFunction } from "@/lib/hooks/use-server-function"
import { getEthAddress, getIpfsUrl, getShortEthAddress } from "@/lib/utils"
import { PlusIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { AnimatedSalary } from "../animated-salary"
import { WithdrawSalaryButton } from "../withdraw-salary-button"
import { useUserGrants } from "./use-user-grants"

export const RecipientPopover = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()
  const { grants, earnings, refetch } = useUserGrants(address)
  const closeRef = useRef<HTMLButtonElement>(null)

  const { data, isLoading } = useServerFunction(getUserUpdatesChannel, "updates-channel", [address])

  useEffect(() => {
    setIsVisible(!!address)
  }, [address])

  const hasGrants = grants.length > 0

  if (!isVisible) return null

  const { isFlowsMember, isNounsMember, updatesChannel, hasFarcasterAccount } = data || {}

  const canPostUpdates = !isLoading && (isNounsMember || isFlowsMember)
  const needsVerify = !isLoading && !hasFarcasterAccount
  const shouldJoinFlowsChannel = !isLoading && !isNounsMember && !isFlowsMember

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs">
          <AnimatedSalary
            value={earnings.claimable ? Number(earnings.claimable) / 1e18 : 0}
            monthlyRate={earnings.monthly}
          />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[480px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <div>
          <div className="flex items-center justify-between space-x-1.5">
            <p className="text-sm text-muted-foreground">
              You&apos;re earning <Currency>{earnings.yearly}</Currency> per year.
            </p>
            {canPostUpdates && (
              <a
                href={`https://warpcast.com/~/compose?text=&channelKey=${updatesChannel}`}
                target="_blank"
              >
                <Button size="xs" variant="outline">
                  <PlusIcon className="mr-1.5 size-3" /> Update
                </Button>
              </a>
            )}
          </div>
          {hasGrants ? (
            <>
              <div className="mt-6">
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
                        href={`/item/${grant.id}`}
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
                        onSuccess={refetch}
                        flow={getEthAddress(grant.parentContract)}
                        pools={[grant.flow.baselinePool, grant.flow.bonusPool].map((pool) =>
                          getEthAddress(pool),
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {needsVerify && (
                <Alert className="mt-6" variant="default">
                  <AlertDescription>
                    Please connect your wallet address ({getShortEthAddress(address)}) with
                    Farcaster account.
                    <br />
                    <Button asChild size="sm" variant="default" className="mt-2">
                      <a href="https://warpcast.com/~/settings/verified-addresses" target="_blank">
                        Verify on Farcaster
                      </a>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {shouldJoinFlowsChannel && (
                <Alert className="mt-6" variant="default">
                  <AlertDescription>
                    Please join the Flows channel on Farcaster to post updates about your work.
                    <br />
                    <Button asChild size="sm" variant="default" className="mt-2">
                      <a
                        href="https://warpcast.com/~/channel/flows/join?inviteCode=35EHtdIhE-ivqVxl2SaEFg"
                        target="_blank"
                      >
                        Join /flows
                      </a>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center space-x-2 space-y-4 rounded-xl border border-border bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
              <Button size="lg" asChild>
                <Link href="/apply">Apply now</Link>
              </Button>
              <p className="px-2">Apply for a grant today to start earning.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
