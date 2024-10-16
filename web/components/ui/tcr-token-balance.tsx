import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { useERC20Supply } from "@/lib/tcr/use-erc20-supply"

export const TcrTokenBalance = ({
  balance,
  className,
  erc20,
}: {
  balance: string
  className: string
  erc20: `0x${string}`
}) => {
  const { totalSupply } = useERC20Supply(erc20)
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <TcrTokenBalanceWithTooltip balance={balance} totalSupply={totalSupply} />
    </div>
  )
}

const TcrTokenBalanceWithTooltip = ({
  balance,
  totalSupply,
}: {
  balance: string
  totalSupply: bigint
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>{balance}</TooltipTrigger>
      <TooltipContent>
        {((Number(balance) / (Number(totalSupply) / 10 ** 18)) * 100).toFixed(2)}% of TCR supply
      </TooltipContent>
    </Tooltip>
  )
}
