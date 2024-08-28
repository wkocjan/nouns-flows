"use client"

import { useModal } from "connectkit"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
  type BaseError,
} from "wagmi"

export const useContractTransaction = (args: {
  chainId: number
  onSuccess?: (hash: string) => void
}) => {
  const { chainId, onSuccess } = args
  const [toastId, setToastId] = useState<number | string>()
  const [callbackHandled, setCallbackHandled] = useState(false)
  const {
    data: hash,
    isPending,
    error,
    ...writeContractRest
  } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { chainId: connectedChainId, isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { setOpen } = useModal()

  useEffect(() => {
    if (callbackHandled || !toastId) return

    if (isLoading && hash) {
      toast.loading("Transaction in progress...", {
        action: {
          label: "View",
          onClick: () => window.open(`https://basescan.org/tx/${hash}`), // TODO: make the url dynamic for other chains
        },
        id: toastId,
      })
      return
    }

    if (error) {
      toast.error(
        ((error as BaseError).shortMessage || error.message).replace(
          "User ",
          "You ",
        ),
        {
          id: toastId,
        },
      )
      setCallbackHandled(true)
      return
    }

    if (isSuccess && hash) {
      toast.success("Transaction confirmed", { id: toastId, duration: 10000 })
      onSuccess?.(hash)
      setCallbackHandled(true)
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error, isSuccess])

  return {
    isPending,
    isConfirming: isLoading,
    isConfirmed: isSuccess,
    isLoading: isLoading || isPending,
    hash,
    prepareWallet: async () => {
      setCallbackHandled(false)

      if (!isConnected) return setOpen(true)

      if (chainId !== connectedChainId) {
        try {
          await switchChainAsync({ chainId })
        } catch (e) {
          toast.error(`Please switch to ${chainId} network`)
          return
        }
      }

      setToastId(toast.loading("Confirm in your wallet..."))
    },
    ...writeContractRest,
  }
}