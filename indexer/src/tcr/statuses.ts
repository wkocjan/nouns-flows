import { ponder, type Context, type Event } from "@/generated"
import { Status } from "../enums"
import { getAddress } from "viem"

ponder.on("NounsFlowTcr:ItemStatusChange", handleItemStatusChange)
ponder.on("NounsFlowTcrChildren:ItemStatusChange", handleItemStatusChange)

async function handleItemStatusChange(params: {
  event: Event<"NounsFlowTcr:ItemStatusChange">
  context: Context<"NounsFlowTcr:ItemStatusChange">
}) {
  const { event, context } = params
  const { _itemID, _itemStatus, _disputed, _resolved } = event.args

  const tcr = event.log.address.toLowerCase()

  const { items } = await context.db.Grant.findMany({ where: { tcr, isFlow: true } })
  const flow = items?.[0]
  if (!flow) throw new Error("Flow not found for TCR item")

  const grant = await context.db.Grant.findUnique({ id: _itemID })
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

  await context.db.Grant.update({
    id: _itemID,
    data: {
      status: _itemStatus,
      isDisputed: _disputed,
      isResolved: _resolved,
      challengePeriodEndsAt,
    },
  })

  if (_itemStatus === Status.ClearingRequested) {
    await context.db.Grant.update({
      id: _itemID,
      data: { challengedRecipientCount: flow.challengedRecipientCount + 1 },
    })
  }
}
