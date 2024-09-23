import { createConfig } from "@ponder/core";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { nounsFlowAddress, nounsFlowImplAbi } from "./abis";
import { isDevelopment } from "./src/lib/utils";

const client = createPublicClient({
  chain: base,
  transport: http(process.env.PONDER_RPC_URL_8453),
});

const currentBlock = Number(await client.getBlockNumber());

const START_BLOCK = 20118986;
const SECONDS_PER_BLOCK = 12;

export default createConfig({
  database: {
    kind: "postgres",
    schema: "public",
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
      abi: nounsFlowImplAbi,
      address: nounsFlowAddress[8453],
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowChildren: {
      abi: nounsFlowImplAbi,
      factory: {
        address: nounsFlowAddress[8453],
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
    Balance: {
      network: "base",
      interval: (isDevelopment() ? 3600 : 60) / SECONDS_PER_BLOCK, // 1 hour in dev, 1 minute otherwise
      startBlock: currentBlock,
    },
  },
});
