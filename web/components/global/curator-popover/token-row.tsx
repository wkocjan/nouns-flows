import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { cn, getIpfsUrl } from "@/lib/utils"

import { Grant } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { formatEther } from "viem"

interface TokenRowProps {
  flow: Pick<Grant, "id" | "title" | "image">
  challengedCount: number
  awaitingCount: number
  closePopover: () => void
  balance: string
}

export function TokenRow(props: TokenRowProps) {
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
