import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Grant: p.createTable(
    {
      id: p.string(),
      recipient: p.string(),
      isFlow: p.boolean(),
      title: p.string(),
      description: p.string(),
      image: p.string(),
      tagline: p.string().optional(),
      url: p.string().optional(),
      isRemoved: p.boolean(),
      blockNumber: p.string(),
      parent: p.string().optional(),
    },
    {
      isFlowIndex: p.index("isFlow"),
      isRemovedIndex: p.index("isRemoved"),
      parentIndex: p.index("parent"),
      recipientIndex: p.index("recipient"),
    }
  ),
}));
