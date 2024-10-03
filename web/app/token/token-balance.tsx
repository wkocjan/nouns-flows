import { formatEther } from "viem"

export const TokenBalance = ({ balance }: { balance: bigint }) => {
  if (!balance && balance !== BigInt(0)) return null

  const formattedBalance = Number(formatEther(balance))
  const displayBalance =
    formattedBalance < 0.1 && formattedBalance !== 0
      ? formattedBalance.toFixed(3)
      : formattedBalance.toString()
  return (
    <p className="whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-50">
      Balance: {displayBalance}
    </p>
  )
}
