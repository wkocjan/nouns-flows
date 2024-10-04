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

export const CuratorPopover = () => {
  const [isVisible, setIsVisible] = useState(false)
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
        <p className="text-sm text-muted-foreground">
          You&apos;re{" "}
          <Link
            href="/curate"
            className="text-primary underline transition-colors hover:text-primary/80"
            onClick={closePopover}
          >
            curator
          </Link>{" "}
          in {tokens.length} categories with {formatEther(totalBalance || BigInt(0))} votes.
        </p>
        <div className="mt-6">
          <div className="mb-2 grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground">
            <div className="col-start-3 text-center">Your votes</div>
            <div className="text-center max-sm:break-all">Challenged</div>
            <div className="text-center max-sm:break-all">Awaiting</div>
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
      </PopoverContent>
    </Popover>
  )
}

interface TokenRowProps {
  flow: Pick<Grant, "id" | "title" | "image">
  challengedCount: number
  awaitingCount: number
  closePopover: () => void
  balance: string
}

function TokenRow(props: TokenRowProps) {
  const { flow, challengedCount, awaitingCount, closePopover, balance } = props

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
      <div
        className={cn("text-center text-sm font-medium", {
          "text-muted-foreground opacity-75": challengedCount === 0,
        })}
      >
        {challengedCount}
      </div>
      <div
        className={cn("text-center text-sm font-medium", {
          "text-muted-foreground opacity-75": awaitingCount === 0,
        })}
      >
        {awaitingCount}
      </div>
    </div>
  )
}
