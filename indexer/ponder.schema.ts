import { createSchema } from "@ponder/core"

export default createSchema((p) => ({
  Grant: p.createTable(
    {
      id: p.string(),
      recipient: p.string(),
      flowId: p.string(),
      submitter: p.string(),
      parentContract: p.string(),
      isTopLevel: p.boolean(),
      isFlow: p.boolean(),
      title: p.string(),
      description: p.string(),
      image: p.string(),
      tagline: p.string().optional(),
      url: p.string().optional(),
      isRemoved: p.boolean(),
      isActive: p.boolean(),
      votesCount: p.string(),
      monthlyFlowRate: p.string(),
      totalEarned: p.string(),
      claimableBalance: p.string(),
      tcr: p.string(),
      erc20: p.string(),
      arbitrator: p.string(),
      tokenEmitter: p.string(),
      status: p.int(),
      challengePeriodEndsAt: p.int(),
      isDisputed: p.boolean(),
      isResolved: p.boolean(),
      evidenceGroupID: p.string(),
      createdAt: p.int(),
      updatedAt: p.int(),
    },
    {
      isTopLevelIndex: p.index("isTopLevel"),
      isFlowIndex: p.index("isFlow"),
      isRemovedIndex: p.index("isRemoved"),
      updatedAtIndex: p.index("updatedAt"),
      flowIdIndex: p.index("flowId"),
      isDisputedIndex: p.index("isDisputed"),
      isActiveIndex: p.index("isActive"),
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
  Dispute: p.createTable(
    {
      id: p.string(),
      disputeId: p.string(),
      arbitrator: p.string(),
      arbitrable: p.string(),
      grantId: p.string(),
      challenger: p.string(),
      votingStartTime: p.int(),
      votingEndTime: p.int(),
      revealPeriodEndTime: p.int(),
      appealPeriodEndTime: p.int(),
      votes: p.int(),
      ruling: p.int(),
      totalSupply: p.string(),
      isExecuted: p.boolean(),
    },
    {
      arbitratorIndex: p.index("arbitrator"),
    }
  ),
  DisputeVote: p.createTable(
    {
      id: p.string(),
      arbitrator: p.string(),
      disputeId: p.string(),
      secretHash: p.string(),
      voter: p.string(),

      choice: p.int().optional(),
      votes: p.string().optional(),
      reason: p.string().optional(),
    },
    {
      disputeIdIndex: p.index("disputeId"),
      arbitratorIndex: p.index("arbitrator"),
    }
  ),
}))
