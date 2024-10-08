import Link from "next/link"
import Image from "next/image"
import { ActiveCuratorGrant } from "./hooks/get-user-tcr-tokens"
import { useWithdrawVoterRewards } from "./hooks/use-withdraw-voter-rewards"
import { cn, getEthAddress, getIpfsUrl } from "@/lib/utils"
import { DateTime } from "@/components/ui/date-time"
import {
  canBeChallenged,
  canDisputeBeExecuted,
  canDisputeBeVotedOn,
  isDisputeRevealingVotes,
  isDisputeWaitingForVoting,
} from "@/lib/database/helpers/application"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "@radix-ui/react-icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatEther } from "viem"

export function ActiveCuratorGrantRow({
  grant,
  closePopover,
}: {
  grant: ActiveCuratorGrant
  closePopover: () => void
}) {
  const { isResolved, title, image, id, challengePeriodEndsAt, disputes } = grant

  const { withdrawRewards, voterRewardsBalance } = useWithdrawVoterRewards(
    getEthAddress(grant.parentArbitrator),
    disputes[0]?.disputeId ? BigInt(disputes[0]?.disputeId) : undefined,
    BigInt(0), // only 1 round for now
  )

  return (
    <div className="grid grid-cols-4 items-center border-t border-border py-2">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden text-ellipsis">
        <Image
          src={getIpfsUrl(image)}
          alt={title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link
          onClick={closePopover}
          href={`/application/${id}`}
          className="truncate text-sm hover:underline"
        >
          {title}
        </Link>
      </div>
      <div className="col-span-2 flex items-center justify-end space-x-2 overflow-hidden text-ellipsis">
        {canBeChallenged(grant) && (
          <div className="text-xs text-muted-foreground">
            Approved{" "}
            <b>
              <DateTime date={new Date(challengePeriodEndsAt * 1000)} relative />
            </b>
          </div>
        )}
        {Boolean(grant.isDisputed) && disputes?.[0] && (
          <>
            {canDisputeBeVotedOn(grant.disputes[0]) && (
              <Link onClick={closePopover} href={`/application/${id}`}>
                <Button variant={grant.disputes[0].votes?.length ? "outline" : "default"} size="xs">
                  {grant.disputes[0].votes?.length ? "Voted" : "Vote"}
                </Button>
              </Link>
            )}
            {isDisputeRevealingVotes(grant.disputes[0]) && (
              <Link
                className="text-xs text-muted-foreground"
                onClick={closePopover}
                href={`/application/${id}`}
              >
                Revealing
              </Link>
            )}
            {isDisputeWaitingForVoting(grant.disputes[0]) && (
              <Link
                className="text-xs text-muted-foreground"
                onClick={closePopover}
                href={`/application/${id}`}
              >
                Voting opens soon
              </Link>
            )}
            {canDisputeBeExecuted(grant.disputes[0]) && (
              <Link onClick={closePopover} href={`/application/${id}`}>
                <Button size="xs">Execute</Button>
              </Link>
            )}
          </>
        )}
        {Boolean(isResolved) && disputes?.[0] && (
          <div
            className={cn("text-xs text-muted-foreground", {
              "text-green-500": disputes[0].votes?.length > 0,
              "text-yellow-500": !disputes[0].votes?.length,
            })}
          >
            {disputes?.[0]?.votes?.length ? (
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Button
                    onClick={() => {
                      withdrawRewards(BigInt(disputes[0].disputeId), BigInt(0))
                    }}
                    size="xs"
                    variant="ghost"
                    disabled={Number(voterRewardsBalance) <= 0}
                  >
                    <div className="text-center text-sm">{formatEther(voterRewardsBalance)}</div>
                    <DownloadIcon className="ml-1 size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Withdraw voter rewards</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger>
                  <div className="px-2">Absent</div>
                </TooltipTrigger>
                <TooltipContent>Did not vote in dispute</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
