"use client"

import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useState } from "react"
import { toast } from "sonner"
import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useSellTokenQuote } from "./hooks/useSellTokenQuote"
import { formatUSDValue, useETHPrice } from "./hooks/useETHPrice"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { TokenBalance } from "./token-balance"
import { SwitchSwapBoxButton } from "./switch-box-button"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { TokenBalanceAndUSDValue } from "./token-balance-usd-value"
import { useERC20Tokens } from "@/lib/tcr/use-erc20s"
import { TokenSwitcherDialog } from "./token-switcher-dialog"
import { EthConversionBox } from "./eth-conversion-box"

interface Props {
  defaultTokenAmount: bigint
  switchSwapBox: () => void
  defaultToken: Address
  defaultTokenEmitter: Address
  parentFlowContract: Address
}

const chainId = base.id

export function SellTokenBox(props: Props) {
  const {
    defaultTokenAmount,
    switchSwapBox,
    defaultToken,
    defaultTokenEmitter,
    parentFlowContract,
  } = props
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)
  const [token, setToken] = useState(defaultToken)
  const [tokenEmitter, setTokenEmitter] = useState(defaultTokenEmitter)

  const { balances, refetch } = useERC20Balances([getEthAddress(token)], address)
  const tokenBalance = balances?.[0]

  const { tokens } = useERC20Tokens([token], chainId)
  const tokenSymbol = tokens?.[0]?.symbol

  const {
    payment,
    isLoading: isLoadingQuote,
    isError,
  } = useSellTokenQuote(getEthAddress(tokenEmitter), tokenAmountBigInt, chainId)

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens sold successfully!",
    onSuccess: async (hash) => {
      await refetch()
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
              <TokenSwitcherDialog
                parentFlowContract={parentFlowContract}
                switchToken={(token, tokenEmitter) => {
                  setToken(token)
                  setTokenEmitter(tokenEmitter)
                }}
                currentToken={token}
                currentTokenEmitter={tokenEmitter}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-white">
                {formatUSDValue(ethPrice || 0, payment)}
              </span>
              <div
                onClick={() =>
                  setTokenAmount((Number(tokenBalance) / 1e18).toString(), tokenBalance)
                }
                className="cursor-pointer"
              >
                <TokenBalance balance={tokenBalance} />
              </div>
            </div>
          </div>
        </ConversionBox>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />
        <EthConversionBox label="Receive" amount={payment} isLoadingQuote={isLoadingQuote}>
          <TokenBalanceAndUSDValue
            balance={balance?.value || BigInt(0)}
            ethPrice={ethPrice || 0}
            ethAmount={payment}
          />
        </EthConversionBox>
      </div>
      <div className="mt-7 w-full">
        <Button
          className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
          disabled={
            isLoading ||
            isLoadingQuote ||
            isError ||
            !tokenBalance ||
            tokenBalance < tokenAmountBigInt
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
                address: tokenEmitter,
                chainId,
                args: [tokenAmountBigInt, minPaymentWithSlippage],
              })
            } catch (e: any) {
              toast.error(e.message, { id: toastId })
            }
          }}
        >
          {tokenBalance < tokenAmountBigInt ? `Insufficient ${tokenSymbol} balance` : "Sell"}
        </Button>
      </div>
    </div>
  )
}