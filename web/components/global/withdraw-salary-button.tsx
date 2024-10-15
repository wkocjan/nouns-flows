"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "@radix-ui/react-icons"
import { useClaimableFlowsBalance } from "./hooks/use-claimable-flows-balance"
import { useBulkPoolWithdrawMacro } from "./hooks/use-bulk-pool-withdraw-macro"

export const WithdrawSalaryButton = ({
  pools,
  flow,
  size = "xs",
}: {
  pools: `0x${string}`[]
  flow: `0x${string}`
  size?: ButtonProps["size"]
}) => {
  const { withdraw } = useBulkPoolWithdrawMacro(pools)

  const { balance, isLoading } = useClaimableFlowsBalance(flow)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn({ "text-green-500": Number(balance) > 0 })}
          size={size}
          onClick={() => {
            withdraw()
          }}
          variant="ghost"
          disabled={balance === BigInt(0) || isLoading}
        >
          <Currency className="text-center text-sm">{Number(balance) / 1e18}</Currency>
          <DownloadIcon className="ml-1 size-3.5" />
        </Button>
      </TooltipTrigger>
      {balance === BigInt(0) && !isLoading && (
        <TooltipContent>No rewards to withdraw</TooltipContent>
      )}
    </Tooltip>
  )
}
