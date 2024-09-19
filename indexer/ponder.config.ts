import { createConfig } from "@ponder/core";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { NounsFlowAbi } from "./abis/NounsFlowAbi";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.PONDER_RPC_URL_8453),
});

const currentBlock = Number(await client.getBlockNumber());

export const NOUNS_FLOW = "0xe6a3ca8bf49e974a2cc6002f5984a97fd418e913" as const;
const START_BLOCK = 19640603;
const SECONDS_PER_BLOCK = 12;

export default createConfig({
  database: {
    kind: "postgres",
  },
  networks: {
    base: {
      chainId: base.id,
      transport: http(process.env.PONDER_RPC_URL_8453),
      maxRequestsPerSecond: 25,
    },
  },
  contracts: {
    NounsFlow: {
      abi: NounsFlowAbi,
      address: NOUNS_FLOW,
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowChildren: {
      abi: NounsFlowAbi,
      factory: {
        address: NOUNS_FLOW,
        event: parseAbiItem(
          "event FlowRecipientCreated(uint256 indexed recipientId, address indexed recipient)"
        ),
        parameter: "recipient",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
  },
  blocks: {
    PoolBalance: {
      network: "base",
      interval: 300 / SECONDS_PER_BLOCK, // every 5 minutes
      startBlock: currentBlock,
    },
    TotalEarned: {
      network: "base",
      interval: 60 / SECONDS_PER_BLOCK, // every 1 minute
      startBlock: currentBlock,
    },
  },
});
