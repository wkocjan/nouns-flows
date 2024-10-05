"use client"

import { Badge } from "@/components/ui/badge"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { useUserTcrTokens } from "./use-user-tcr-tokens"
import Image from "next/image"
import { SwapTokenButton } from "@/app/token/swap-token-button"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"

export const CuratorPopover = ({ flow }: { flow: Grant }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "voted">("active")
  const { address } = useAccount()
  const { tokens, totalBalance } = useUserTcrTokens(address)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsVisible(!!address && tokens.length > 0)
  }, [address, tokens])

  if (!isVisible) return null

  const closePopover = () => closeRef.current?.click()

  return (
    <Popover>
      <PopoverTrigger>
        <Badge className="h-[26px] rounded-full text-xs" variant="warning">
          {formatEther(totalBalance || BigInt(0))}
        </Badge>
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
            {tokens.length} categories with {formatEther(totalBalance || BigInt(0))} tokens.
          </p>
          <SwapTokenButton size="sm" flow={flow} />
        </div>
        <div className="mt-6">
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
              activeCount={flow.subgrants.filter((g) => g.isActive).length}
              challengedCount={flow.subgrants.filter((g) => g.isDisputed && !g.isActive).length}
              awaitingCount={
                flow.subgrants.filter((g) => !g.isActive && !g.isDisputed && !g.isResolved).length
              }
              closePopover={closePopover}
            />
          ))}
        </div>
        <div className="border-t border-border pt-6">
          <div className="flex flex-row items-center space-x-3 text-sm">
            <VotingMenuItem
              onClick={() => setActiveTab("active")}
              isActive={activeTab === "active"}
              label="Active"
            />

            <VotingMenuItem
              onClick={() => setActiveTab("upcoming")}
              isActive={activeTab === "upcoming"}
              label="Upcoming"
            />

            <VotingMenuItem
              onClick={() => setActiveTab("voted")}
              isActive={activeTab === "voted"}
              label="Voted"
            />
          </div>
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

interface TokenRowProps {
  flow: Pick<Grant, "id" | "title" | "image">
  challengedCount: number
  awaitingCount: number
  activeCount: number
  closePopover: () => void
  balance: string
}

function TokenRow(props: TokenRowProps) {
  const { flow, challengedCount, awaitingCount, closePopover, balance, activeCount } = props

  return (
    <div className="grid grid-cols-5 items-center gap-2 border-t border-border py-2">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
        <Image
          src={getIpfsUrl(flow.image)}
          alt={flow.title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link
          href={`/flow/${flow.id}`}
          className="truncate text-sm hover:underline"
          onClick={closePopover}
        >
          {flow.title}
        </Link>
      </div>
      <div className="text-center text-sm font-medium">{formatEther(BigInt(balance))}</div>
      <GrantStatusCountBadges challengedCount={challengedCount} awaitingCount={awaitingCount} />
      <div
        className={cn("text-center text-sm font-medium", {
          "text-muted-foreground opacity-75": awaitingCount === 0,
        })}
      >
        ${awaitingCount}
      </div>
    </div>
  )
}
