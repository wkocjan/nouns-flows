"use server"

import { nounsFlowImplAbi } from "@/lib/abis"
import { l2Client } from "@/lib/viem/client"
import { getAddress, getContract } from "viem"

async function getClaimableBalance(address: string, recipient: string) {
  const contract = getContract({
    abi: nounsFlowImplAbi,
    address: getAddress(address),
    client: { public: l2Client },
  })

  const totalEarned = await contract.read.getClaimableBalance([getAddress(recipient)])

  return totalEarned
}

// pull and sum all the balances from the contract
// return the total balance
export async function getClaimableBalances(addresses: string[], recipient: string) {
  const balances = await Promise.all(
    addresses.map((address) => getClaimableBalance(address, recipient)),
  )
  return balances.reduce((acc, balance) => acc + balance, BigInt(0))
}
