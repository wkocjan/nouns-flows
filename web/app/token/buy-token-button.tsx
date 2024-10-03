import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { createRelayClient } from "@/lib/relay/client"
import { getEthAddress } from "@/lib/utils"
import { getChain, l1Client, l2Client } from "@/lib/viem/client"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { toast } from "sonner"
import { Address, createWalletClient, custom, http, zeroAddress } from "viem"
import { base, mainnet } from "viem/chains"
import { useAccount, useBalance } from "wagmi"

const toChainId = base.id

export const BuyTokenButton = ({
  onSuccess,
  tokenEmitter,
  costWithRewardsFee,
  tokenAmountBigInt,
  isLoadingRewardsQuote,
  selectedChain,
}: {
  onSuccess: (hash: string) => void
  tokenEmitter: Address
  costWithRewardsFee: bigint
  tokenAmountBigInt: bigint
  isLoadingRewardsQuote: boolean
  selectedChain: RelayChain
}) => {
  const chainId = selectedChain.id
  const { address } = useAccount()
  const { data: balance } = useBalance({ address, chainId })

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens bought successfully!",
    onSuccess: async (hash) => {
      onSuccess(hash)
    },
  })

  const insufficientBalance =
    balance && balance.value < BigInt(Math.trunc(Number(costWithRewardsFee) * 1.05))

  return (
    <Button
      className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
      disabled={isLoading || isLoadingRewardsQuote || !balance || insufficientBalance}
      loading={isLoading}
      type="button"
      onClick={async () => {
        try {
          const costWithSlippage = BigInt(Math.trunc(Number(costWithRewardsFee) * 1.02))

          await prepareWallet()

          const args: [Address, bigint, bigint, { builder: Address; purchaseReferral: Address }] = [
            address as `0x${string}`,
            tokenAmountBigInt,
            costWithSlippage,
            {
              builder: zeroAddress,
              purchaseReferral: zeroAddress,
            },
          ]

          const useRelay = chainId !== toChainId

          if (useRelay) {
            const publicClient = chainId === mainnet.id ? l1Client : l2Client

            const { request } = await publicClient.simulateContract({
              address: tokenEmitter,
              abi: tokenEmitterImplAbi,
              functionName: "buyToken",
              args,
              value: costWithSlippage,
              chain: getChain(chainId),
              account: address,
            })

            const wallet = createWalletClient({
              chain: getChain(chainId),
              transport: custom(window.ethereum!),
            })

            const relayClient = createRelayClient(chainId)

            const quote = await relayClient.actions.getQuote({
              chainId,
              toChainId,
              currency: "0x0000000000000000000000000000000000000000",
              toCurrency: "0x0000000000000000000000000000000000000000",
              amount: costWithSlippage.toString(),
              tradeType: "EXACT_OUTPUT",
              wallet,
              txs: [request],
            })

            await relayClient.actions.execute({
              quote,
              wallet,
              onProgress: (steps) => {
                console.log(steps)
              },
            })
          } else {
            writeContract({
              account: address,
              abi: tokenEmitterImplAbi,
              functionName: "buyToken",
              address: getEthAddress(tokenEmitter),
              chainId,
              args,
              value: costWithSlippage,
            })
          }
        } catch (e: any) {
          toast.error(e.message, { id: toastId })
        }
      }}
    >
      {insufficientBalance ? "Insufficient ETH balance" : "Buy"}
    </Button>
  )
}
