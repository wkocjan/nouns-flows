import { createSchema } from "@ponder/core"

export default createSchema((p) => ({
  Grant: p.createTable(
    {
      id: p.string(),
      recipient: p.string(),
      recipientId: p.string(),
      isTopLevel: p.boolean(),
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
      totalEarned: p.string(),
      claimableBalance: p.string(),
      tcr: p.string(),
      erc20: p.string(),
      arbitrator: p.string(),
      tokenEmitter: p.string(),
      applicationId: p.string(),
      updatedAt: p.int(),
    },
    {
      recipientIdIndex: p.index("recipientId"),
      isTopLevelIndex: p.index("isTopLevel"),
      isFlowIndex: p.index("isFlow"),
      isRemovedIndex: p.index("isRemoved"),
      parentIndex: p.index("parent"),
      recipientIndex: p.index("recipient"),
      updatedAtIndex: p.index("updatedAt"),
      applicationIdIndex: p.index("applicationId"),
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

  Application: p.createTable(
    {
      id: p.string(),
      flowId: p.string(),
      submitter: p.string(),
      recipient: p.string(),
      title: p.string(),
      description: p.string(),
      image: p.string(),
      tagline: p.string(),
      url: p.string(),
      isFlow: p.boolean(),
      blockNumber: p.string(),
      status: p.int(),
      evidenceGroupID: p.string(),
      createdAt: p.int(),
      updatedAt: p.int(),
      challengePeriodEndsAt: p.int(),
      isDisputed: p.boolean(),
      isResolved: p.boolean(),
    },
    {
      statusIndex: p.index("status"),
      flowIdIndex: p.index("flowId"),
    }
  ),
}))
