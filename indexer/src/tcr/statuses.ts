import { ponder, type Context, type Event } from "@/generated"

ponder.on("NounsFlowTcr:ItemStatusChange", handleItemStatusChange)
ponder.on("NounsFlowTcrChildren:ItemStatusChange", handleItemStatusChange)

async function handleItemStatusChange(params: {
  event: Event<"NounsFlowTcr:ItemStatusChange">
  context: Context<"NounsFlowTcr:ItemStatusChange">
}) {
  const { event, context } = params
  const { _itemID, _itemStatus, _disputed, _resolved, _requestIndex } = event.args

  await context.db.Application.update({
    id: _itemID,
    data: {
      status: _itemStatus,
      isResolved: _resolved,
      isDisputed: _disputed,
    },
  })
}
