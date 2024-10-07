import { Button } from "@/components/ui/button"
import { GrantStatusCountBadges } from "@/components/ui/grant-status-count-badges"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"

import { Grant } from "@prisma/client"
import { DownloadIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import Link from "next/link"
import { formatEther } from "viem"
import { useWithdrawSuperToken } from "../hooks/use-withdraw-super-token"
import { useConnectSuperfluidDistributionPool } from "../hooks/use-connect-superfluid-distribution-pool"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
      <GrantStatusCountBadges
        hideChallenged={challengedCount === 0}
        challengedCount={challengedCount}
        awaitingCount={awaitingCount}
      />
      <div className="text-center text-sm font-medium text-green-500">
        <WithdrawButton
          superToken={getEthAddress(flow.superToken)}
          pool={getEthAddress(flow.managerRewardSuperfluidPool)}
        />
      </div>
    </div>
  )
}

const WithdrawButton = ({
  superToken,
  pool,
}: {
  superToken: `0x${string}`
  pool: `0x${string}`
}) => {
  const { withdraw, poolBalance } = useWithdrawSuperToken(superToken, pool)
  const { connect, isConnected } = useConnectSuperfluidDistributionPool(pool)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => {
            if (!isConnected) {
              connect()
            } else {
              withdraw(poolBalance)
            }
          }}
          variant="ghost"
          disabled={poolBalance === BigInt(0)}
        >
          <Currency className="text-center text-sm">{Number(poolBalance) / 1e18}</Currency>
          <DownloadIcon className="ml-1 size-3.5" />
        </Button>
      </TooltipTrigger>
      {!isConnected && <TooltipContent>Click to connect to the rewards pool.</TooltipContent>}
      {poolBalance === BigInt(0) && <TooltipContent>No rewards to withdraw.</TooltipContent>}
    </Tooltip>
  )
}
