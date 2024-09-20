// Top level flow contract - on Base
export const NOUNS_FLOW_PROXY = "0xe6a3ca8bf49e974a2cc6002f5984a97fd418e913"

// Nouns token contract (for voting power) - on Mainnet
export const NOUNS_TOKEN = "0xda7c313e392e75c6179f5f9cd8952075ac3e1ec5" // Nouns Test
// export const NOUNS_TOKEN = "0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03" // Nouns

// 1 Noun = VOTING_POWER_SCALE votes
export const VOTING_POWER_SCALE = BigInt(1000)

// Voting scale from the contract
export const PERCENTAGE_SCALE = 1e6

export const NOUNS_SUBGRAPH_ID = "5qcR6rAfDMZCVGuZ6DDois7y4zyXqsyqvaqhE6NRRraW"

// Max voting power for a user (limit # of nouns to vote with)
export const MAX_VOTING_POWER = BigInt(6000)
