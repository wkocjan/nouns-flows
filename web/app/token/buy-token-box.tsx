"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { useTcrToken } from "@/lib/tcr/use-tcr-token"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useMemo, useState } from "react"
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
import { SwitchSwapBoxButton } from "./switch-box-button"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { createRelayClient } from "@/lib/relay/client"
import { Grant } from "@prisma/client"
import { BaseEthLogo } from "./base-eth-logo"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
  switchSwapBox: () => void
}

const chainId = base.id

export function BuyTokenBox(props: Props) {
  const { flow, defaultTokenAmount, switchSwapBox } = props
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const { chains } = useMemo(() => createRelayClient(chainId), [])

  const [selectedChain, setSelectedChain] = useState<RelayChain>(
    () => chains.find(({ id }) => id === chainId) || chains[0],
  )

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
    onSuccess: async (hash) => {
      await token.refetch()
    },
  })

  const setTokenAmount = (value: string) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

  const insufficientBalance =
    balance && balance.value < BigInt(Math.trunc(Number(costWithRewardsFee) * 1.05))

  return (
    <div className="space-y-1 rounded-3xl bg-white p-1.5 dark:bg-black/90">
      <div className="relative flex flex-col">
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

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CurrencyDisplay className="cursor-pointer py-0.5">
                    <BaseEthLogo />
                    <span className="pl-0.5 pr-1">ETH</span>
                    <div className="mt-0.5 pr-1 text-black dark:text-white">
                      <svg
                        width="12"
                        height="7"
                        viewBox="0 0 12 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0.97168 1L6.20532 6L11.439 1" stroke="currentColor"></path>
                      </svg>
                    </div>
                  </CurrencyDisplay>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <TokenLogo src="/eth.png" alt="ETH" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      </div>
      <div className="mt-4 w-full">
        <Button
          className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
          disabled={isLoading || isLoadingRewardsQuote || !balance || insufficientBalance}
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
          {insufficientBalance ? "Insufficient ETH balance" : "Buy"}
        </Button>
      </div>
    </div>
  )
}
