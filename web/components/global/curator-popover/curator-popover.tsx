"use client"

import { Badge } from "@/components/ui/badge"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useUserTcrTokens } from "./hooks/use-user-tcr-tokens"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { CuratorGrants } from "./curator-grants"
import {
  canDisputeBeExecuted,
  canRequestBeExecuted,
  isDisputeVotingOver,
} from "@/lib/database/helpers/application"
import { TokenRow } from "./token-row"

type ActiveTab = "active" | "upcoming" | "voted"

export const CuratorPopover = ({ flow }: { flow: Grant }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("active")
  const { address } = useAccount()
  const { tokens, totalBalance, totalRewardsBalance } = useUserTcrTokens(address)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsVisible(!!address && tokens.length > 0)
  }, [address, tokens])

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
            className="flex h-[26px] flex-row items-center space-x-1.5 rounded-full text-xs"
            variant="success"
          >
            <span>${formatEther(totalRewardsBalance)}</span>
            {hasActiveSubgrants && (
              <div className="size-2 animate-pulse rounded-full bg-primary"></div>
            )}
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[100vw] md:mr-8 md:w-[480px]">
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
            {tokens.length} {`flow${tokens.length > 1 ? "s" : ""}`} with{" "}
            {formatEther(totalBalance || BigInt(0))} tokens.
          </p>
          <SwapTokenButton size="xs" flow={flow} />
        </div>
        <div className="mt-8">
          <div className="mb-2 grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
            <div className="col-start-3 text-center">Balance</div>
            <div className="text-center max-sm:break-all">Grants</div>
            <div className="text-center max-sm:break-all">Rewards</div>
          </div>
          {tokens.map(({ id, flow, amount }) => (
            <TokenRow
              key={id}
              flow={flow}
              balance={amount}
              challengedCount={flow.subgrants.filter((g) => g.isDisputed && !g.isActive).length}
              awaitingCount={
                flow.subgrants.filter((g) => !g.isActive && !g.isDisputed && !g.isResolved).length
              }
              closePopover={closePopover}
            />
          ))}
        </div>

        <div className="flex flex-col space-y-5 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Curate incoming grants to continue earning rewards.
          </p>
          <div className="flex flex-row items-center space-x-3 text-sm">
            <VotingMenuItem
              onClick={() => setActiveTab("active")}
              isActive={activeTab === "active"}
              label="Active"
            />

            <VotingMenuItem
              onClick={() => setActiveTab("voted")}
              isActive={activeTab === "voted"}
              label="Voted"
            />
          </div>
        </div>
        <div className="mt-2">
          {activeTab === "active" && (
            <CuratorGrants closePopover={closePopover} grants={activeSubgrants} />
          )}
          {activeTab === "voted" && (
            <CuratorGrants closePopover={closePopover} grants={votedSubgrants} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const VotingMenuItem = ({
  onClick,
  isActive,
  label,
}: {
  onClick: () => void
  isActive: boolean
  label: string
}) => {
  return (
    <div
      onClick={onClick}
      className={cn("cursor-pointer text-sm", {
        "text-muted-foreground opacity-75": !isActive,
      })}
    >
      {label}
    </div>
  )
}
