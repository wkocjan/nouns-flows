import { nounsFlowAddress, nounsTokenAddress } from "./abis"

// Flow contracts
export const NOUNS_FLOW = nounsFlowAddress[8453]

// Nouns token contract (for voting power)
export const NOUNS_TOKEN = (process.env.NEXT_PUBLIC_NOUNS_TOKEN_ADDRESS ||
  nounsTokenAddress[1]) as `0x${string}`

// x Noun = x * VOTING_POWER_SCALE votes
export const VOTING_POWER_SCALE = BigInt(1000)

// Voting scale from the contract
export const PERCENTAGE_SCALE = 1e6

// Subgraph ID
export const NOUNS_SUBGRAPH_ID = "5qcR6rAfDMZCVGuZ6DDois7y4zyXqsyqvaqhE6NRRraW"

// Max voting power for a user (limit # of nouns to vote with)
export const MAX_VOTING_POWER = BigInt(6000)

// Farcaster Channel ID
export const FARCASTER_CHANNEL_ID = "nouns"

export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`
