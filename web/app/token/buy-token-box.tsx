"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { Grant } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"
import { formatEther, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useBuyTokenQuote, useBuyTokenQuoteWithRewards } from "./hooks/useBuyTokenQuote"
import { formatUSDValue, useETHPrice } from "./hooks/useETHPrice"
import { CostDifferenceTooltip } from "./cost-difference-tooltip"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { CurrencyDisplay } from "./currency-display"
import { TokenBalance } from "./token-balance"
import { TokenLogo } from "./token-logo"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
}

const chainId = base.id

export function BuyTokenBox(props: Props) {
  const { flow, defaultTokenAmount } = props
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const {
    totalCost: costWithRewardsFee,
    isLoading: isLoadingRewardsQuote,
    addedSurgeCost,
  } = useBuyTokenQuoteWithRewards(getEthAddress(flow.tokenEmitter), tokenAmountBigInt, chainId)

  const { totalCost: rawCost } = useBuyTokenQuote(
    getEthAddress(flow.tokenEmitter),
    tokenAmountBigInt,
    chainId,
  )

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens purchased successfully!",
    onSuccess: async (hash) => {},
  })

  const setTokenAmount = (value: string) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

  return (
    <div className="space-y-2 rounded-3xl bg-white p-1.5 dark:bg-black/90">
      <ConversionBox label="Buy">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <CurrencyInput
              id="amount"
              name="amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
            />
            <CurrencyDisplay>
              <TokenLogo src={getIpfsUrl(flow.image)} alt="TCR token" />
              <span className="px-1">{token.symbol}</span>
            </CurrencyDisplay>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-white">
              {formatUSDValue(ethPrice || 0, rawCost - addedSurgeCost)}
            </span>
            <TokenBalance balance={token.balance} />
          </div>
        </div>
      </ConversionBox>

      <ConversionBox label="Pay">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <CurrencyInput
              id="cost"
              name="cost"
              value={Number(formatEther(costWithRewardsFee)).toFixed(12)}
              disabled
              className={cn("disabled:text-black dark:disabled:text-white", {
                "opacity-50": isLoadingRewardsQuote,
                "opacity-100": !isLoadingRewardsQuote,
              })}
            />
            <CurrencyDisplay>
              <TokenLogo src="/eth.png" alt="ETH" />
              <span className="px-1">ETH</span>
            </CurrencyDisplay>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 dark:text-white">
                {formatUSDValue(ethPrice || 0, costWithRewardsFee)}
              </span>
              <CostDifferenceTooltip
                rawCost={rawCost}
                addedSurgeCost={addedSurgeCost}
                costWithRewardsFee={costWithRewardsFee}
              />
            </div>
            <TokenBalance balance={balance?.value || BigInt(0)} />
          </div>
        </div>
      </ConversionBox>
      <div className="mt-4 w-full">
        <Button
          className="w-full rounded-2xl py-7 text-xl font-normal tracking-wide"
          disabled={
            isLoading ||
            isLoadingRewardsQuote ||
            !balance ||
            balance.value < BigInt(Math.trunc(Number(costWithRewardsFee) * 1.05))
          }
          loading={isLoading}
          type="button"
          onClick={async () => {
            try {
              await prepareWallet()

              const costWithSlippage = BigInt(Math.trunc(Number(costWithRewardsFee) * 1.02))

              writeContract({
                account: address,
                abi: tokenEmitterImplAbi,
                functionName: "buyToken",
                address: getEthAddress(flow.tokenEmitter),
                chainId,
                args: [
                  address as `0x${string}`,
                  tokenAmountBigInt,
                  costWithSlippage,
                  {
                    builder: zeroAddress,
                    purchaseReferral: zeroAddress,
                  },
                ],
                value: costWithSlippage,
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          Swap
        </Button>
      </div>
    </div>
  )
}
