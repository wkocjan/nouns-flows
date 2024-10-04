import { createConfig } from "@ponder/core"
import { createPublicClient, http, parseAbiItem } from "viem"
import { base } from "viem/chains"
import {
  erc20VotesArbitratorAddress,
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableAddress,
  erc20VotesMintableImplAbi,
  flowTcrAddress,
  flowTcrImplAbi,
  nounsFlowAddress,
  nounsFlowImplAbi,
  tcrFactoryAddress,
  tcrFactoryImplAbi,
} from "./abis"

const client = createPublicClient({
  chain: base,
  transport: http(process.env.PONDER_RPC_URL_8453),
})

const currentBlock = Number(await client.getBlockNumber())

const START_BLOCK = 20118986
const SECONDS_PER_BLOCK = 12

export default createConfig({
  database: { kind: "postgres", schema: "public" },
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
          "event FlowRecipientCreated(bytes32 indexed recipientId, address indexed recipient)"
        ),
        parameter: "recipient",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcr: {
      abi: flowTcrImplAbi,
      address: flowTcrAddress[8453],
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcrChildren: {
      abi: flowTcrImplAbi,
      factory: {
        address: tcrFactoryAddress[8453],
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy)"
        ),
        parameter: "flowTCRProxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcrFactory: {
      abi: tcrFactoryImplAbi,
      address: tcrFactoryAddress[8453],
      network: "base",
      startBlock: START_BLOCK,
    },
    Arbitrator: {
      abi: erc20VotesArbitratorImplAbi,
      address: erc20VotesArbitratorAddress[8453],
      network: "base",
      startBlock: START_BLOCK,
    },
    ArbitratorChildren: {
      abi: erc20VotesArbitratorImplAbi,
      factory: {
        address: tcrFactoryAddress[8453],
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy)"
        ),
        parameter: "arbitratorProxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    Erc20Token: {
      abi: erc20VotesMintableImplAbi,
      address: erc20VotesMintableAddress[8453],
      network: "base",
      startBlock: START_BLOCK,
    },
    Erc20TokenChildren: {
      abi: erc20VotesMintableImplAbi,
      factory: {
        address: tcrFactoryAddress[8453],
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy)"
        ),
        parameter: "erc20Proxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
  },
  blocks: {
    Balance: {
      network: "base",
      interval: (process.env.NODE_ENV === "development" ? 3600 : 60) / SECONDS_PER_BLOCK, // 1 hour in dev, 1 minute otherwise
      startBlock: currentBlock,
    },
  },
})
