import { createConfig, mergeAbis, rateLimit } from "@ponder/core"
import { createPublicClient, http, parseAbiItem } from "viem"
import { base } from "viem/chains"
import {
  erc20VotesArbitratorImplAbi,
  erc20VotesMintableImplAbi,
  flowTcrImplAbi,
  nounsFlowImplAbi,
  superfluidPoolAbi,
  tcrFactoryImplAbi,
  gdav1Address,
  gdav1ImplAbi,
} from "./abis"
import { base as baseContracts } from "./addresses"

const currentBlock = Number(
  await createPublicClient({
    chain: base,
    transport: http(process.env.PONDER_RPC_URL_8453),
  }).getBlockNumber()
)

const START_BLOCK = 21465220
const SECONDS_PER_BLOCK = 2

export default createConfig({
  database: { kind: "postgres", schema: "public" },
  networks: {
    base: {
      chainId: base.id,
      transport: rateLimit(http(process.env.PONDER_RPC_URL_8453), {
        requestsPerSecond: 20,
      }),
    },
  },
  contracts: {
    NounsFlow: {
      abi: nounsFlowImplAbi,
      address: baseContracts.NounsFlow,
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowChildren: {
      abi: nounsFlowImplAbi,
      factory: {
        address: baseContracts.NounsFlow,
        event: parseAbiItem(
          "event FlowRecipientCreated(bytes32 indexed recipientId, address indexed recipient, address baselinePool, address bonusPool, uint32 managerRewardPoolFlowRatePercent, uint32 baselinePoolFlowRatePercent)"
        ),
        parameter: "recipient",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcr: {
      abi: flowTcrImplAbi,
      address: baseContracts.FlowTCR,
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcrChildren: {
      abi: flowTcrImplAbi,
      factory: {
        address: baseContracts.TCRFactory,
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy, address flowBaselinePool, address flowBonusPool)"
        ),
        parameter: "flowTCRProxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    NounsFlowTcrFactory: {
      abi: tcrFactoryImplAbi,
      address: baseContracts.TCRFactory,
      network: "base",
      startBlock: START_BLOCK,
    },
    Arbitrator: {
      abi: erc20VotesArbitratorImplAbi,
      address: baseContracts.ERC20VotesArbitrator,
      network: "base",
      startBlock: START_BLOCK,
    },
    ArbitratorChildren: {
      abi: erc20VotesArbitratorImplAbi,
      factory: {
        address: baseContracts.TCRFactory,
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy, address flowBaselinePool, address flowBonusPool)"
        ),
        parameter: "arbitratorProxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    Erc20Token: {
      abi: erc20VotesMintableImplAbi,
      address: baseContracts.ERC20VotesMintable,
      network: "base",
      startBlock: START_BLOCK,
    },
    Erc20TokenChildren: {
      abi: erc20VotesMintableImplAbi,
      factory: {
        address: baseContracts.TCRFactory,
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy, address flowBaselinePool, address flowBonusPool)"
        ),
        parameter: "erc20Proxy",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    BaselinePool: {
      abi: superfluidPoolAbi,
      address: baseContracts.BaselinePool,
      network: "base",
      startBlock: START_BLOCK,
    },
    BonusPool: {
      abi: superfluidPoolAbi,
      address: baseContracts.BonusPool,
      network: "base",
      startBlock: START_BLOCK,
    },
    BaselinePoolChildren: {
      abi: superfluidPoolAbi,
      factory: {
        address: baseContracts.TCRFactory,
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy, address flowBaselinePool, address flowBonusPool)"
        ),
        parameter: "flowBaselinePool",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    BonusPoolChildren: {
      abi: superfluidPoolAbi,
      factory: {
        address: baseContracts.TCRFactory,
        event: parseAbiItem(
          "event FlowTCRDeployed(address indexed sender, address indexed flowTCRProxy, address indexed arbitratorProxy, address erc20Proxy, address rewardPoolProxy, address tokenEmitterProxy, address flowProxy, address flowBaselinePool, address flowBonusPool)"
        ),
        parameter: "flowBonusPool",
      },
      network: "base",
      startBlock: START_BLOCK,
    },
    GdaV1: {
      abi: gdav1ImplAbi,
      address: gdav1Address[8453],
      network: "base",
      startBlock: START_BLOCK,
      filter: {
        event: "FlowDistributionUpdated",
        args: {
          // usdc on base
          token: "0xd04383398dd2426297da660f9cca3d439af9ce1b",
        },
      },
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
