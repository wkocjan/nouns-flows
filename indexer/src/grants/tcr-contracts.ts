import { ponder } from "@/generated"

ponder.on("NounsFlowTcrFactory:FlowTCRDeployed", async (params) => {
  const { event, context } = params
  const { Grant } = context.db

  const { flowTCRProxy, arbitratorProxy, erc20Proxy, flowProxy, tokenEmitterProxy } = event.args

  await Grant.updateMany({
    where: { recipient: flowProxy.toLowerCase() },
    data: {
      tcr: flowTCRProxy.toLowerCase(),
      arbitrator: arbitratorProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
      tokenEmitter: tokenEmitterProxy.toLowerCase(),
    },
  })
})
