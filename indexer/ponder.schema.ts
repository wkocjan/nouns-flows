import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Grant: p.createTable(
    {
      id: p.string(),
      recipient: p.string(),
      recipientId: p.string(),
      isFlow: p.boolean(),
      title: p.string(),
      description: p.string(),
      image: p.string(),
      tagline: p.string().optional(),
      url: p.string().optional(),
      isRemoved: p.boolean(),
      blockNumber: p.string(),
      parent: p.string(),
      votesCount: p.string(),
      monthlyFlowRate: p.string(),
    },
    {
      recipientIdIndex: p.index("recipientId"),
      isFlowIndex: p.index("isFlow"),
      isRemovedIndex: p.index("isRemoved"),
      parentIndex: p.index("parent"),
      recipientIndex: p.index("recipient"),
    }
  ),
  Vote: p.createTable(
    {
      id: p.string(),
      contract: p.string(),
      recipientId: p.string(),
      tokenId: p.string(),
      bps: p.int(),
      voter: p.string(),
      blockNumber: p.string(),
      isStale: p.boolean(),
      votesCount: p.string(),
    },
    {
      voterIndex: p.index("voter"),
      contractIndex: p.index("contract"),
      recipientIdIndex: p.index("recipientId"),
      isStaleIndex: p.index("isStale"),
    }
  ),
}));
