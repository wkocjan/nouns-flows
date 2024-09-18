"use server"

import { NOUNS_TOKEN } from "@/lib/config"
import { l1Client, l2Client } from "@/lib/viem/client"
import { encodeAbiParameters, keccak256, PublicClient, toHex, type Address } from "viem"
import { getBeaconBlock } from "./get-beacon-block"
import { getBeaconRootAndL2Timestamp } from "./get-beacon-root-and-l2-timestamp"
import { getExecutionStateRootProof } from "./get-execution-state-root-proof"

export async function generateOwnerProofs(tokenIds: bigint[], delegators: Address[]) {
  try {
    // Step 1: Get the latest beacon root and L2 timestamp
    // This function retrieves the parentBeaconBlockRoot and timestamp from the latest L2 block
    const beaconInfo = await getBeaconRootAndL2Timestamp(l2Client as PublicClient)

    // Step 2: Fetch the beacon block using the beacon root
    // This function makes an API call to retrieve the beacon block data
    const block = await getBeaconBlock(beaconInfo.beaconRoot)

    // Step 3: Generate the execution state root proof
    // This function creates a proof for the execution state root within the beacon block
    const stateRootInclusion = await getExecutionStateRootProof(block)

    const ownerMappingSlot = BigInt(3)

    const ownerProofs = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const slot = keccak256(
          encodeAbiParameters(
            [{ type: "uint256" }, { type: "uint256" }],
            [tokenId, ownerMappingSlot],
          ),
        )

        // Step 4: Get the storage proof from the L1 client
        const proof = await l1Client.getProof({
          address: NOUNS_TOKEN,
          storageKeys: [slot],
          blockNumber: BigInt(block.body.executionPayload.blockNumber),
        })

        return proof
      }),
    )

    const delegateMappingSlot = BigInt(11)
    const delegateProofs = await Promise.all(
      delegators.map(async (delegator) => {
        const slot = keccak256(
          encodeAbiParameters(
            [{ type: "address" }, { type: "uint256" }],
            [delegator, delegateMappingSlot],
          ),
        )

        // Get the storage proof from the L1 client
        const proof = await l1Client.getProof({
          address: NOUNS_TOKEN,
          storageKeys: [slot],
          blockNumber: BigInt(block.body.executionPayload.blockNumber),
        })

        return proof
      }),
    )

    // Construct the final proof object
    return {
      beaconRoot: beaconInfo.beaconRoot,
      beaconOracleTimestamp: BigInt(toHex(beaconInfo.timestampForL2BeaconOracle, { size: 32 })),
      executionStateRoot: stateRootInclusion.leaf,
      stateRootProof: stateRootInclusion.proof,
      accountProof: ownerProofs[0].accountProof, // same for all
      ownershipStorageProofs: ownerProofs.map((proof) => proof.storageProof[0].proof),
      delegateStorageProofs: delegateProofs.map((proof) => proof.storageProof[0].proof),
      error: false as const,
    }
  } catch (e) {
    console.error(e)
    return { error: (e as Error).message || "Chain generated error" }
  }
}
