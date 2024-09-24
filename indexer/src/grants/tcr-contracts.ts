import { ponder } from "@/generated"

ponder.on("NounsFlowTcrFactory:FlowTCRDeployed", async (params) => {
  const { event, context } = params
  const { Grant } = context.db

  const { flowTCRProxy, arbitratorProxy, erc20Proxy } = event.args

  // ToDo: Will come in event.args after contract upgrade
  const flowContract = await context.client.readContract({
    address: flowTCRProxy,
    abi: context.contracts.NounsFlowTcr.abi,
    functionName: "flowContract",
    args: [],
  })

  await Grant.updateMany({
    where: { recipient: flowContract.toLowerCase() },
    data: {
      tcr: flowTCRProxy.toLowerCase(),
      arbitrator: arbitratorProxy.toLowerCase(),
      erc20: erc20Proxy.toLowerCase(),
    },
  })
})
