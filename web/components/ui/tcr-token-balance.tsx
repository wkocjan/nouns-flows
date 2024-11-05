import { cn } from "@/lib/utils"
import { Currency } from "./currency"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { useERC20Supply } from "@/lib/tcr/use-erc20-supply"

export const TcrTokenBalance = ({
  balance,
  className,
  erc20,
  monthlyRewardPoolRate,
}: {
  balance: string
  className: string
  erc20: `0x${string}`
  monthlyRewardPoolRate: string
}) => {
  const { totalSupply } = useERC20Supply(erc20)
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <TcrTokenBalanceWithTooltip
        balance={balance}
        totalSupply={totalSupply}
        monthlyRewardPoolRate={monthlyRewardPoolRate}
      />
    </div>
  )
}

const TcrTokenBalanceWithTooltip = ({
  balance,
  totalSupply,
  monthlyRewardPoolRate,
}: {
  balance: string
  totalSupply: bigint
  monthlyRewardPoolRate: string
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>{Math.round(Number(balance))}</TooltipTrigger>
      <TooltipContent>
        Earning {formatPercentage(balance, totalSupply)}% of the{" "}
        <Currency>{monthlyRewardPoolRate}</Currency>/mo reward pool
      </TooltipContent>
    </Tooltip>
  )
}

function formatPercentage(balance: string, totalSupply: bigint) {
  const percentage = (Number(balance) / (Number(totalSupply) / 10 ** 18)) * 100
  const decimalPlaces = percentage < 1 ? 4 : percentage < 10 ? 1 : 0
  return percentage.toFixed(decimalPlaces)
}
