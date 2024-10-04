import { ponder, type Context, type Event } from "@/generated"
import { zeroAddress } from "viem"

ponder.on("Erc20Token:Transfer", handleTransfer)
ponder.on("Erc20TokenChildren:Transfer", handleTransfer)

async function handleTransfer(params: {
  event: Event<"Erc20Token:Transfer">
  context: Context<"Erc20Token:Transfer">
}) {
  const { event, context } = params
  const { value } = event.args

  const tokenContract = event.log.address.toLowerCase()
  const from = event.args.from.toLowerCase()
  const to = event.args.to.toLowerCase()

  // Decrease the amount from the sender
  if (from !== zeroAddress) {
    await context.db.TokenHolder.update({
      id: `${tokenContract}-${from}`,
      data: ({ current }) => ({ amount: (BigInt(current.amount) - value).toString() }),
    })
  }

  // Increase the amount for the receiver
  if (to !== zeroAddress) {
    await context.db.TokenHolder.upsert({
      id: `${tokenContract}-${to}`,
      create: { tokenContract, holder: to, amount: value.toString() },
      update: ({ current }) => ({ amount: (BigInt(current.amount) + value).toString() }),
    })
  }
}
