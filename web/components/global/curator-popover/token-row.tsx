import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"

import { Grant } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { formatEther } from "viem"
import { WithdrawCuratorSalaryButton } from "../withdraw-curator-salary-button"

interface TokenRowProps {
  flow: Pick<Grant, "id" | "title" | "image" | "superToken" | "managerRewardSuperfluidPool">
  challengedCount: number
  awaitingCount: number
  closePopover: () => void
  balance: string
}

export function TokenRow(props: TokenRowProps) {
  const { flow, challengedCount, awaitingCount, closePopover, balance } = props

  return (
    <div className="grid grid-cols-6 items-center gap-2 border-t border-border py-2.5">
      <div className="col-span-3 flex items-center space-x-2 overflow-hidden">
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
      <GrantStatusCountBadges
        hideChallenged={challengedCount === 0}
        challengedCount={challengedCount}
        awaitingCount={awaitingCount}
      />
      <div className="text-center text-sm font-medium">
        <WithdrawCuratorSalaryButton pool={getEthAddress(flow.managerRewardSuperfluidPool)} />
      </div>
    </div>
  )
}
