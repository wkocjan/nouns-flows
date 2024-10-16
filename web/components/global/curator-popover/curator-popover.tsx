"use client"

import {
  canDisputeBeExecuted,
  canRequestBeExecuted,
  isDisputeVotingOver,
} from "@/app/components/dispute/helpers"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grant } from "@prisma/client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { CuratorGrants } from "./curator-grants"
import { useUserTcrTokens } from "./hooks/use-user-tcr-tokens"
import { TokenRow } from "./token-row"
import { AnimatedSalary } from "../animated-salary"

export const CuratorPopover = ({ flow }: { flow: Grant }) => {
  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()
  const { tokens, totalBalance, earnings } = useUserTcrTokens(address)
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
        !g.isActive &&
        !g.isResolved &&
        !canRequestBeExecuted(g) &&
        !canDisputeBeExecuted(g.disputes?.[0]),
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
      <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[500px]">
        <PopoverClose ref={closeRef} className="hidden" />
        <div className="flex flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            You{" "}
            <Link
              href="/curate"
              className="text-primary underline transition-colors hover:text-primary/80"
              onClick={closePopover}
            >
              curate
            </Link>{" "}
            {tokens.length} {`flow${tokens.length !== 1 ? "s" : ""}`} with{" "}
            {formatEther(totalBalance || BigInt(0))} tokens.
          </p>
          <SwapTokenButton size="xs" flow={flow} />
        </div>
        {tokens.length > 0 ? (
          <>
            <div className="mt-8">
              <div className="mb-2 grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground">
                <div className="col-start-4 text-center">Balance</div>
                <div className="text-center max-sm:break-all">Flows</div>
                <div className="text-center max-sm:break-all">Rewards</div>
              </div>
              {tokens.map(({ id, flow, amount }) => (
                <TokenRow
                  key={id}
                  flow={flow}
                  balance={amount}
                  challengedCount={flow.subgrants.filter((g) => g.isDisputed && !g.isActive).length}
                  awaitingCount={
                    flow.subgrants.filter((g) => !g.isActive && !g.isDisputed && !g.isResolved)
                      .length
                  }
                  closePopover={closePopover}
                />
              ))}
            </div>

            <p className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground">
              Curate incoming flows to continue earning rewards.
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
            <div className="mt-8 flex flex-col items-center justify-center rounded-xl border-t border-border bg-gray-200/30 py-6 text-sm text-muted-foreground dark:bg-gray-800">
              <p> Buy TCR tokens to curate flows and earn rewards.</p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
