import { ponder, type Context, type Event } from "@/generated";
import { NOUNS_FLOW } from "../ponder.config";

ponder.on("NounsFlowChildren:RecipientCreated", handleRecipientCreated);
ponder.on("NounsFlow:RecipientCreated", handleRecipientCreated);

ponder.on("NounsFlowChildren:RecipientRemoved", handleRecipientRemoved);
ponder.on("NounsFlow:RecipientRemoved", handleRecipientRemoved);

async function handleRecipientCreated(params: {
  event: Event<"NounsFlow:RecipientCreated">;
  context: Context<"NounsFlow:RecipientCreated">;
}) {
  const { event, context } = params;
  const { Grant } = context.db;
  const { recipient, recipientId } = event.args;

  const contract = event.log.address.toLowerCase() as `0x${string}`;

  await Grant.create({
    id: `${recipientId}_${contract}`,
    data: {
      recipient: recipient.recipient.toLowerCase(),
      recipientId: recipientId.toString(),
      blockNumber: event.block.number.toString(),
      isFlow: recipient.recipientType === 1,
      isRemoved: recipient.removed,
      parent: event.transaction.to?.toLowerCase() || NOUNS_FLOW,
      votesCount: "0",
      monthlyFlowRate: "0",
      updatedAt: Number(event.block.timestamp),
      totalEarned: "0",
      ...recipient.metadata,
    },
  });
}

async function handleRecipientRemoved(params: {
  event: Event<"NounsFlow:RecipientRemoved">;
  context: Context<"NounsFlow:RecipientRemoved">;
}) {
  const { event, context } = params;
  const { Grant } = context.db;
  const { recipientId, recipient } = event.args;

  await Grant.update({
    id: `${recipientId}_${recipient}`,
    data: { isRemoved: true },
  });
}
