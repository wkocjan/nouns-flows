import { defineConfig, loadEnv } from "@wagmi/cli"
import { etherscan } from "@wagmi/cli/plugins"
import { base, mainnet } from "./addresses"

const mainnetContracts = [{ name: "nounsToken", address: mainnet.NounsToken }]

const baseContracts = [
  { name: "nounsFlowImpl", address: base.NounsFlowImpl },
  { name: "nounsFlow", address: base.NounsFlow },

  { name: "flowTcrImpl", address: base.FlowTCRImpl },
  { name: "flowTcr", address: base.FlowTCR },

  { name: "erc20VotesArbitratorImpl", address: base.ERC20VotesArbitratorImpl },
  { name: "erc20VotesArbitrator", address: base.ERC20VotesArbitrator },

  { name: "erc20VotesMintableImpl", address: base.ERC20VotesMintableImpl },
  { name: "erc20VotesMintable", address: base.ERC20VotesMintable },

  { name: "tcrFactoryImpl", address: base.TCRFactoryImpl },
  { name: "tcrFactory", address: base.TCRFactory },

  { name: "tokenEmitterImpl", address: base.TokenEmitterImpl },
  { name: "tokenEmitter", address: base.TokenEmitter },

  { name: "rewardPoolImpl", address: base.RewardPoolImpl },
  { name: "rewardPool", address: base.RewardPool },

  { name: "superToken", address: "0xeb796bdb90ffa0f28255275e16936d25d3418603" },

  { name: "multicall3", address: "0xcA11bde05977b3631167028862bE2a173976CA11" },

  {
    name: "gdav1Forwarder",
    address: "0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08",
  },

  { name: "superfluidMacroForwarder", address: "0xfD01285b9435bc45C243E5e7F978E288B2912de6" },

  {
    name: "SuperfluidPool",
    address: "0x9224413b9177e6c1d5721b4a4d1d00ec84b07ce7",
  },
]

export default defineConfig(() => {
  const env = loadEnv({ mode: process.env.NODE_ENV, envDir: process.cwd() })

  return {
    out: "src/generated.ts",
    contracts: [],
    plugins: [
      etherscan({ apiKey: env.ETHERSCAN_API_KEY, chainId: 1, contracts: mainnetContracts }),
      etherscan({ apiKey: env.BASESCAN_API_KEY, chainId: 8453, contracts: baseContracts }),
    ],
  }
})
