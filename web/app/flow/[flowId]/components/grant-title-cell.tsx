"use client"

import { TableCell } from "@/components/ui/table"
import { tokenEmitterImplAbi } from "@/lib/abis"
import Link from "next/link"
import { base } from "viem/chains"
import { useReadContract } from "wagmi"

export const GrantTitleCell = ({ title, href }: { title: string; href: string }) => {
  const { data, isError, isLoading } = useReadContract({
    abi: tokenEmitterImplAbi,
    address: "0xfeb24deeaf4ce4fba62aae7d9d64f8e6b8e0579b",
    chainId: base.id,
    functionName: "buyTokenQuoteWithRewards",
    args: [BigInt(0)],
  })
  return (
    <TableCell className="max-w-[250px] overflow-hidden truncate text-ellipsis">
      <Link
        href={href}
        className="text-sm font-medium duration-100 ease-out hover:text-primary md:text-lg"
      >
        {title}
      </Link>
    </TableCell>
  )
}
