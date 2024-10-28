"use client"

import { canDisputeBeExecuted, isDisputeVotingOver } from "@/app/components/dispute/helpers"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Status } from "@/lib/enums"
import { Grant } from "@prisma/client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { AnimatedSalary } from "../animated-salary"
import { CuratorGrants } from "./curator-grants"
import { useUserTcrTokens } from "./hooks/use-user-tcr-tokens"
import { TokenRow } from "./token-row"
import { ScrollArea } from "@/components/ui/scroll-area"

export const CuratorPopover = ({ flow }: { flow: Grant }) => {
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()
  const { tokens, earnings } = useUserTcrTokens(address)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsVisible(!!address)
  }, [address])

  if (!isVisible) return null

  const closePopover = () => closeRef.current?.click()

  // active subgrants are all that aren't currently active or didn't resolved non-active
  const activeSubgrants = tokens.flatMap((token) =>
    token.flow.subgrants.filter(
      (g) =>
        (!g.isActive && !g.isResolved && !canDisputeBeExecuted(g.disputes?.[0])) ||
        g.status === Status.ClearingRequested,
    ),
  )

  const votedSubgrants = tokens.flatMap((token) =>
    token.flow.subgrants.filter(
      (g) =>
        ((!g.isResolved && g.isDisputed) || g.isResolved) &&
        g.disputes?.length &&
        isDisputeVotingOver(g.disputes[0]),
    ),
  )

  const hasActiveSubgrants = activeSubgrants.length > 0

  return (
    <Popover>
      <PopoverTrigger>
        <div className="relative flex items-center">
          <Badge
            className="flex h-[26px] flex-row items-center space-x-1 rounded-full text-xs"
            variant="success"
          >
            <AnimatedSalary
              value={earnings.claimable ? Number(earnings.claimable) / 1e18 : 0}
              monthlyRate={earnings.monthly}
            />
            {hasActiveSubgrants && (
              <div className="size-1.5 animate-pulse rounded-full bg-white/50"></div>
            )}
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className="relative flex h-[95vh] w-full max-w-[100vw] flex-col overflow-hidden md:mr-8 md:h-[70vh] md:w-[600px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <ScrollArea className="w-full p-2.5 pb-4 md:pb-0">
          <div className="flex flex-row items-center justify-between">
            <p className="pr-2 text-xs text-muted-foreground md:text-sm">
              You&apos;re earning <Currency>{earnings.yearly}</Currency> per year
              {tokens.length > 0 ? " by" : ","}{" "}
              <Link
                href="/curate"
                className="text-primary underline transition-colors hover:text-primary/80"
                onClick={closePopover}
              >
                curating
              </Link>{" "}
              {tokens.length || "no"} {`flow${tokens.length !== 1 ? "s" : ""}`}.
            </p>

            {tokens.length > 0 && <SwapTokenButton size="xs" flow={flow} />}
          </div>
          {tokens.length > 0 ? (
            <>
              <div className="mt-8">
                <div className="mb-2 grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-start-3 text-center">Balance</div>
                  <div className="text-center max-sm:break-all">Grants</div>
                  <div className="text-center max-sm:break-all">Rewards</div>
                </div>
                {tokens
                  .sort((a, b) => Number(b.amount) - Number(a.amount))
                  .map(({ id, flow, amount }) => (
                    <TokenRow
                      key={id}
                      flow={flow}
                      balance={amount}
                      subgrants={flow.subgrants}
                      closePopover={closePopover}
                    />
                  ))}
              </div>

              <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground md:text-sm">
                Curate incoming grants to continue earning rewards.
              </p>

              <Tabs defaultValue="active" className="mt-4 w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="voted">Voted</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <CuratorGrants closePopover={closePopover} grants={activeSubgrants} />
                </TabsContent>
                <TabsContent value="voted">
                  <CuratorGrants closePopover={closePopover} grants={votedSubgrants} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              <div className="mt-8 flex flex-col items-center justify-center space-x-2 space-y-4 rounded-xl border border-border bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
                <SwapTokenButton text="Become a curator" size="lg" flow={flow} />
                <p className="px-2">Buy TCR tokens to curate grants and earn rewards.</p>
              </div>
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
