"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useClaimableFlowsBalance } from "./hooks/use-claimable-flows-balance"
import { useConnectSuperfluidDistributionPool } from "./hooks/use-connect-superfluid-distribution-pool"
import { useWithdrawSuperToken } from "./hooks/use-withdraw-super-token"

export const WithdrawSalaryButton = ({
  superToken,
  pool,
  flow,
  size = "xs",
}: {
  superToken: `0x${string}`
  pool: `0x${string}`
  flow: `0x${string}`
  size?: ButtonProps["size"]
}) => {
  const { withdraw } = useWithdrawSuperToken(superToken, pool)
  const { connect, isConnected, isLoading } = useConnectSuperfluidDistributionPool(pool)

  const { balance } = useClaimableFlowsBalance(flow)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn({ "text-green-500": Number(balance) > 0 })}
          size={size}
          onClick={() => {
            if (!isConnected) {
              connect()
            } else {
              withdraw(balance)
            }
          }}
          variant="ghost"
          disabled={balance === BigInt(0) && isConnected}
        >
          <Currency className="text-center text-sm">{Number(balance) / 1e18}</Currency>
          <DownloadIcon className="ml-1 size-3.5" />
        </Button>
      </TooltipTrigger>
      {!isConnected && !isLoading && <TooltipContent>Connect to the rewards pool</TooltipContent>}
      {isConnected && balance === BigInt(0) && (
        <TooltipContent>No rewards to withdraw</TooltipContent>
      )}
    </Tooltip>
  )
}
