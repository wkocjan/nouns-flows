"use client"

import { tokenEmitterImplAbi } from "@/lib/abis"
import { base } from "viem/chains"
import { useReadContract } from "wagmi"

export const MRE = () => {
  const { data, isError, isLoading } = useReadContract({
    abi: tokenEmitterImplAbi,
    address: "0xfeb24deeaf4ce4fba62aae7d9d64f8e6b8e0579b",
    chainId: base.id,
    functionName: "buyTokenQuoteWithRewards",
    args: [BigInt(0)],
  })
  return <div>Hello bug</div>
}
