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
import { formatEther } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useSellTokenQuote } from "./hooks/useSellTokenQuote"
import { formatUSDValue, useETHPrice } from "./hooks/useETHPrice"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { CurrencyDisplay } from "./currency-display"
import { TokenBalance } from "./token-balance"
import { TokenLogo } from "./token-logo"
import { SwitchSwapBoxButton } from "./switch-box-button"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
  switchSwapBox: () => void
}

const chainId = base.id

export function SellTokenBox(props: Props) {
  const { flow, defaultTokenAmount, switchSwapBox } = props
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const token = useTcrToken(getEthAddress(flow.erc20), getEthAddress(flow.tcr), chainId)

  const {
    payment,
    isLoading: isLoadingQuote,
    isError,
  } = useSellTokenQuote(getEthAddress(flow.tokenEmitter), tokenAmountBigInt, chainId)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens sold successfully!",
    onSuccess: async (hash) => {
      await token.refetch()
    },
  })

  const setTokenAmount = (value: string, valueBigInt?: bigint) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(valueBigInt || BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

  return (
    <div className="space-y-1 rounded-3xl bg-white p-1.5 dark:bg-black/90">
      <div className="relative flex flex-col">
        <ConversionBox label="Sell">
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
                {formatUSDValue(ethPrice || 0, payment)}
              </span>
              <div
                onClick={() =>
                  setTokenAmount((Number(token.balance) / 1e18).toString(), token.balance)
                }
                className="cursor-pointer"
              >
                <TokenBalance balance={token.balance} />
              </div>
            </div>
          </div>
        </ConversionBox>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />

        <ConversionBox label="Receive">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <CurrencyInput
                id="payment"
                name="payment"
                value={Number(formatEther(payment)).toFixed(12)}
                disabled
                className={cn("disabled:text-black dark:disabled:text-white", {
                  "opacity-50": isLoadingQuote,
                  "opacity-100": !isLoadingQuote,
                })}
              />
              <CurrencyDisplay>
                <TokenLogo src="/eth.png" alt="ETH" />
                <span className="px-1">ETH</span>
              </CurrencyDisplay>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-white">
                {formatUSDValue(ethPrice || 0, payment)}
              </span>
              <TokenBalance balance={balance?.value || BigInt(0)} />
            </div>
          </div>
        </ConversionBox>
      </div>
      <div className="mt-7 w-full">
        <Button
          className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
          disabled={
            isLoading ||
            isLoadingQuote ||
            isError ||
            !token.balance ||
            token.balance < tokenAmountBigInt
          }
          loading={isLoading}
          type="button"
          onClick={async () => {
            try {
              await prepareWallet()

              const minPaymentWithSlippage = BigInt(Math.trunc(Number(payment) * 0.98))

              writeContract({
                account: address,
                abi: tokenEmitterImplAbi,
                functionName: "sellToken",
                address: getEthAddress(flow.tokenEmitter),
                chainId,
                args: [tokenAmountBigInt, minPaymentWithSlippage],
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          {token.balance < tokenAmountBigInt ? `Insufficient ${token.symbol} balance` : "Sell"}
        </Button>
      </div>
    </div>
  )
}
