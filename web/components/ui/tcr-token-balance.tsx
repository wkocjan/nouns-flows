import { cn } from "@/lib/utils"
import { Currency } from "./currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { useERC20Supply } from "@/lib/tcr/use-erc20-supply"
import { useSellTokenQuote } from "@/app/token/hooks/useSellTokenQuote"
import { base } from "viem/chains"

import { formatUSDValue } from "@/app/token/hooks/useETHPrice"

export const TcrTokenBalance = ({
  balance,
  className,
  erc20,
  tokenEmitter,
  monthlyRewardPoolRate,
  ethPrice,
}: {
  balance: string
  className: string
  erc20: `0x${string}`
  tokenEmitter: `0x${string}`
  monthlyRewardPoolRate: string
  ethPrice: number
}) => {
  const { totalSupply } = useERC20Supply(erc20)
  const { payment: worth } = useSellTokenQuote(
    tokenEmitter,
    BigInt(Number(balance) * 1e18),
    base.id,
  )

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <TcrTokenBalanceWithTooltip
        balance={balance}
        totalSupply={totalSupply}
        monthlyRewardPoolRate={monthlyRewardPoolRate}
        worth={worth}
        ethPrice={ethPrice}
      />
    </div>
  )
}

const TcrTokenBalanceWithTooltip = ({
  balance,
  totalSupply,
  monthlyRewardPoolRate,
  worth,
  ethPrice,
}: {
  balance: string
  totalSupply: bigint
  monthlyRewardPoolRate: string
  worth: bigint
  ethPrice: number
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex flex-col items-end justify-between">
          <span>{formatUSDValue(ethPrice, worth)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-2">
          <div>
            Earning {formatPercentage(balance, totalSupply)}% of the{" "}
            <Currency>{monthlyRewardPoolRate}</Currency>/mo reward pool
          </div>
          <div>Balance: {Number(balance).toFixed(Number(balance) % 1 ? 2 : 0)}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function formatPercentage(balance: string, totalSupply: bigint) {
  const percentage = (Number(balance) / (Number(totalSupply) / 10 ** 18)) * 100
  const decimalPlaces = percentage < 1 ? 4 : percentage < 10 ? 1 : 0
  return percentage.toFixed(decimalPlaces)
}
