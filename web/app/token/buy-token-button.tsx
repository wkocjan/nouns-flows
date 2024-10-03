import { Button } from "@/components/ui/button"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { getEthAddress } from "@/lib/utils"
import { useContractTransaction } from "@/lib/wagmi/use-contract-transaction"
import { toast } from "sonner"
import { Address, zeroAddress } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"

const chainId = base.id

export const BuyTokenButton = ({
  onSuccess,
  tokenEmitter,
  costWithRewardsFee,
  tokenAmountBigInt,
  isLoadingRewardsQuote,
}: {
  onSuccess: (hash: string) => void
  tokenEmitter: Address
  costWithRewardsFee: bigint
  tokenAmountBigInt: bigint
  isLoadingRewardsQuote: boolean
}) => {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })

  const { prepareWallet, writeContract, toastId, isLoading } = useContractTransaction({
    chainId,
    success: "Tokens sold successfully!",
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
          await prepareWallet()

          const costWithSlippage = BigInt(Math.trunc(Number(costWithRewardsFee) * 1.02))

          writeContract({
            account: address,
            abi: tokenEmitterImplAbi,
            functionName: "buyToken",
            address: getEthAddress(tokenEmitter),
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
  )
}
