import { ponder, type Context, type Event } from "ponder:registry"
import { tokenEmitters, tokenHolders } from "ponder:schema"

ponder.on("TokenEmitter:TokensSold", handleTokensSold)
ponder.on("TokenEmitterChildren:TokensSold", handleTokensSold)

async function handleTokensSold(params: {
  event: Event<"TokenEmitter:TokensSold">
  context: Context<"TokenEmitter:TokensSold">
}) {
  const { event, context } = params
  const { amount, payment, seller } = event.args

  const holder = seller.toLowerCase()

  const tokenEmitter = event.log.address.toLowerCase()
  const tokenEmitterRecord = await context.db.find(tokenEmitters, {
    id: tokenEmitter,
  })

  if (!tokenEmitterRecord) throw new Error("Token emitter not found")
  const erc20 = tokenEmitterRecord.erc20.toLowerCase()

  // Update token holder record with sell info
  await context.db.update(tokenHolders, { id: `${erc20}-${holder}` }).set((row) => ({
    totalSold: (row.totalSold || BigInt(0)) + amount,
    totalSaleProceeds: (row.totalSaleProceeds || BigInt(0)) + payment,
  }))
}
