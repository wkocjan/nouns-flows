"use client"

import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Address, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useBuyTokenQuote, useBuyTokenQuoteWithRewards } from "./hooks/useBuyTokenQuote"
import { useETHPrice } from "./hooks/useETHPrice"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { SwitchSwapBoxButton } from "./switch-box-button"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { createRelayClient } from "@/lib/relay/client"
import { TokenSwitcherDialog } from "./token-switcher-dialog"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { TokenBalanceAndUSDValue } from "./token-balance-usd-value"
import { EthConversionBox } from "./eth-conversion-box"
import { TokenBalanceWithWarning } from "./token-balance-with-warning"
import { SwitchEthChainButton } from "./switch-eth-payment-button"
import { BuyTokenButton } from "./buy-token-button"

interface Props {
  defaultTokenAmount: bigint
  token: Address
  tokenEmitter: Address
  parentFlowContract: Address
  switchSwapBox: () => void
  setTokenAndEmitter: (token: Address, tokenEmitter: Address) => void
}

const chainId = base.id

export function BuyTokenBox({
  defaultTokenAmount,
  token,
  tokenEmitter,
  parentFlowContract,
  switchSwapBox,
  setTokenAndEmitter,
}: Props) {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const { balances, refetch } = useERC20Balances([getEthAddress(token)], address)
  const tokenBalance = balances?.[0]

  const { chains } = useMemo(() => createRelayClient(chainId), [])

  const [selectedChain, setSelectedChain] = useState<RelayChain>(
    () => chains.find(({ id }) => id === chainId) || chains[0],
  )

  const {
    totalCost: costWithRewardsFee,
    isLoading: isLoadingRewardsQuote,
    addedSurgeCost,
  } = useBuyTokenQuoteWithRewards(getEthAddress(tokenEmitter), tokenAmountBigInt, chainId)

  const { totalCost: rawCost } = useBuyTokenQuote(
    getEthAddress(tokenEmitter),
    tokenAmountBigInt,
    chainId,
  )

  const setTokenAmount = (value: string) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

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
              <TokenSwitcherDialog
                parentFlowContract={parentFlowContract}
                switchToken={(token, tokenEmitter) => {
                  setTokenAndEmitter(token, tokenEmitter)
                }}
                currentToken={token}
                currentTokenEmitter={tokenEmitter}
              />
            </div>
            <TokenBalanceAndUSDValue
              balance={tokenBalance}
              ethPrice={ethPrice || 0}
              ethAmount={rawCost - addedSurgeCost}
            />
          </div>
        </ConversionBox>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />

        <EthConversionBox
          currencyDisplay={<SwitchEthChainButton />}
          label="Pay"
          amount={costWithRewardsFee}
          isLoadingQuote={isLoadingRewardsQuote}
        >
          <TokenBalanceWithWarning
            balance={balance?.value || BigInt(0)}
            ethPrice={ethPrice || 0}
            rawCost={rawCost}
            addedSurgeCost={addedSurgeCost}
            costWithRewardsFee={costWithRewardsFee}
          />
        </EthConversionBox>
      </div>

      <BuyTokenButton
        tokenEmitter={tokenEmitter}
        costWithRewardsFee={costWithRewardsFee}
        tokenAmountBigInt={tokenAmountBigInt}
        isLoadingRewardsQuote={isLoadingRewardsQuote}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
