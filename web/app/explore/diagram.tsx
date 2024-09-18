import { autoLayoutDiagram } from "@/components/diagram/auto-layout"
import FlowNode from "@/components/diagram/flow-node"
import grantNode from "@/components/diagram/grant-node"
import PoolNode, { IPoolNode } from "@/components/diagram/pool-node"
import { Background, Edge, Node, Position, ReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { FlowWithGrants } from "../flow/[flowId]/components/get-flow-with-grants"

type Props = {
  flows: FlowWithGrants[]
  budget: number
}

export const FullDiagram = (props: Props) => {
  const { flows, budget } = props

  const mainNodes: Node[] = []
  const edges: Edge[] = []

  mainNodes.push({
    type: "pool",
    id: "pool-1",
    position: { x: 0, y: 0 },
    data: {
      name: `Nouns Flows`,
      logoUrl: "/noggles.svg",
      budget,
    },
    connectable: false,
    width: 240,
    height: 160,
  } satisfies IPoolNode)

  flows.forEach((flow) => {
    mainNodes.push({
      type: "flow",
      id: flow.id,
      data: { flow },
      position: { x: 0, y: 0 },
      connectable: false,
      width: 240,
      height: 100,
    })

    edges.push({
      id: `pool-1-${flow.id}`,
      source: "pool-1",
      target: flow.id,
    })
  })

  const layout = autoLayoutDiagram(mainNodes, edges, "TB")

  const grantNodes: Node[] = []

  layout.nodes
    .filter((n) => n.type === "flow")
    .forEach((node) => {
      const flow = node.data.flow as FlowWithGrants

      flow.subgrants.forEach((grant, index) => {
        grantNodes.push({
          type: "grant",
          id: grant.id,
          data: { grant },
          position: {
            x: node.position.x + 10,
            y: node.position.y + 32 + (index + 1) * (110 + 32),
          },
          connectable: false,
          width: 220,
          height: 120,
          targetPosition: "top" as Position.Top,
        })

        edges.push({
          id: `${flow.id}-${grant.id}`,
          source: flow.id,
          target: grant.id,
        })
      })
    })

  return (
    <div className="grow bg-background">
      <ReactFlow
        defaultNodes={[...layout.nodes, ...grantNodes]}
        defaultEdges={edges}
        fitView
        maxZoom={1}
        colorMode="system"
        nodesDraggable={false}
        snapToGrid
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        nodeTypes={{
          flow: FlowNode,
          pool: PoolNode,
          grant: grantNode,
        }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
          type: "smoothstep",
        }}
      >
        <Background gap={32} />
        {/* <Controls /> */}
        {/* <MiniMap /> */}
      </ReactFlow>
    </div>
  )
}
