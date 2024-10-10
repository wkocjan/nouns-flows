import { Button, ButtonProps } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useConnectSuperfluidDistributionPool } from "./hooks/use-connect-superfluid-distribution-pool"
import { useWithdrawSuperToken } from "./hooks/use-withdraw-super-token"

export const WithdrawCuratorSalaryButton = ({
  superToken,
  pool,
  size = "xs",
}: {
  superToken: `0x${string}`
  pool: `0x${string}`
  size?: ButtonProps["size"]
}) => {
  const { withdraw } = useWithdrawSuperToken(superToken, pool)
  const { connect, isConnected, isLoading } = useConnectSuperfluidDistributionPool(pool)

  const poolBalance = BigInt(0)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn({ "text-green-500": Number(poolBalance) > 0 })}
          size={size}
          onClick={() => {
            if (!isConnected) {
              connect()
            } else {
              withdraw(poolBalance)
            }
          }}
          variant="ghost"
          disabled={poolBalance === BigInt(0) && isConnected}
        >
          <Currency className="text-center text-sm">{Number(poolBalance) / 1e18}</Currency>
          <DownloadIcon className="ml-1 size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {!isConnected && !isLoading && "Connect to the rewards pool"}
        {isConnected && poolBalance === BigInt(0) && "No rewards to withdraw"}
      </TooltipContent>
    </Tooltip>
  )
}
