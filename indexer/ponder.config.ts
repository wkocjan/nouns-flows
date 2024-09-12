import { createConfig } from "@ponder/core";
import { http } from "viem";
import { base } from "viem/chains";
import { NounsFlowAbi } from "./abis/NounsFlowAbi";
import { parseAbiItem } from "viem";

export default createConfig({
  networks: {
    base: {
      chainId: base.id,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    NounsFlow: {
      abi: NounsFlowAbi,
      address: "0xe6a3ca8bf49e974a2cc6002f5984a97fd418e913",
      network: "base",
      startBlock: 19640603,
    },
    NounsFlowChildren: {
      abi: NounsFlowAbi,
      factory: {
        address: "0xe6a3ca8bf49e974a2cc6002f5984a97fd418e913",
        event: parseAbiItem(
          "event FlowRecipientCreated(uint256 indexed recipientId, address indexed recipient)"
        ),
        parameter: "recipient",
      },
      network: "base",
      startBlock: 19640603,
    },
  },
});
