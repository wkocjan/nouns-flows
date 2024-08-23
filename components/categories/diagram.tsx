import { autoLayoutDiagram } from "@/components/diagram/auto-layout"
import CategoryNode from "@/components/diagram/category-node"
import grantNode from "@/components/diagram/grant-node"
import PoolNode, { IPoolNode } from "@/components/diagram/pool-node"
import { Category } from "@/lib/data/categories"
import { getGrantsForCategory } from "@/lib/data/grants"
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Position,
  ReactFlow,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

type Props = {
  categories: Category[]
}

export const CategoriesDiagram = (props: Props) => {
  const { categories } = props

  const mainNodes: Node[] = []
  const edges: Edge[] = []

  mainNodes.push({
    type: "pool",
    id: "pool-1",
    position: { x: 0, y: 0 },
    data: {
      name: `Nouns Grants Pool`,
      logoUrl: "/noggles.svg",
      budget: 10000,
    },
    connectable: false,
    width: 240,
    height: 160,
  } satisfies IPoolNode)

  categories.forEach((category) => {
    mainNodes.push({
      type: "category",
      id: category.id,
      data: { category },
      position: { x: 0, y: 0 },
      connectable: false,
      width: 240,
      height: 100,
    })

    edges.push({
      id: `pool-1-${category.id}`,
      source: "pool-1",
      target: category.id,
    })
  })

  const layout = autoLayoutDiagram(mainNodes, edges, "TB")

  const grantNodes: Node[] = []

  layout.nodes
    .filter((n) => n.type === "category")
    .forEach((node) => {
      const category = node.data.category as Category
      const grants = getGrantsForCategory(category.id)

      grants.forEach((grant, index) => {
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
          id: `${category.id}-${grant.id}`,
          source: category.id,
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
          category: CategoryNode,
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
