import { ponder, type Context, type Event } from "@/generated"
import { Status } from "../enums"
import { getAddress } from "viem"
import { removeApplicationEmbedding } from "./embeddings/embed-applications"

import { eq, and } from "@ponder/core"
import { grants } from "../../ponder.schema"

ponder.on("NounsFlowTcr:ItemStatusChange", handleItemStatusChange)
ponder.on("NounsFlowTcrChildren:ItemStatusChange", handleItemStatusChange)

async function handleItemStatusChange(params: {
  event: Event<"NounsFlowTcr:ItemStatusChange">
  context: Context<"NounsFlowTcr:ItemStatusChange">
}) {
  const { event, context } = params
  const { _itemID, _itemStatus, _disputed, _resolved } = event.args

  const tcr = event.log.address.toLowerCase()

  const flowResults = await context.db.sql
    .select()
    .from(grants)
    .where(and(eq(grants.tcr, tcr), eq(grants.isFlow, true)))

  const flow = flowResults[0]
  if (!flow) throw new Error("Flow not found for TCR item")

  const grantResults = await context.db.sql.select().from(grants).where(eq(grants.id, _itemID))

  const grant = grantResults[0]
  if (!grant) throw new Error(`Grant not found: ${_itemID}`)

  let challengePeriodEndsAt = grant.challengePeriodEndsAt

  // Update challenge period end time if there is a removal request for this grant
  // Previously it was the end of application challenge period
  if (grant.status === Status.Registered && _itemStatus === Status.ClearingRequested) {
    const tcr = event.log.address.toLowerCase()

    const challengePeriodDuration = await context.client.readContract({
      address: getAddress(tcr),
      abi: context.contracts.NounsFlowTcr.abi,
      functionName: "challengePeriodDuration",
    })

    challengePeriodEndsAt = Number(event.block.timestamp + challengePeriodDuration)
  }

  if (grant.status === Status.RegistrationRequested && _itemStatus === Status.Absent) {
    await removeApplicationEmbedding(grant)
  }

  await context.db.update(grants, { id: _itemID }).set({
    status: _itemStatus,
    isDisputed: _disputed,
    isResolved: _resolved,
    challengePeriodEndsAt,
  })

  if (_itemStatus === Status.ClearingRequested) {
    await context.db.update(grants, { id: _itemID }).set((row) => ({
      challengedRecipientCount: row.challengedRecipientCount + 1,
      awaitingRecipientCount: row.awaitingRecipientCount - 1,
    }))
  }
}
