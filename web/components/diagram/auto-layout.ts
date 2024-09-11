import dagre from "@dagrejs/dagre"
import type { Edge, Node } from "@xyflow/react"
import { Position } from "@xyflow/react"

export function autoLayoutDiagram(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "BT" | "LR" | "RL",
) {
  const isHorizontal = direction === "LR" || direction === "RL"

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))

  // https://github.com/dagrejs/dagre/wiki#configuring-the-layout
  g.setGraph({ rankdir: direction, ranksep: 160, nodesep: 40 })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width, height: node.height })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id)
    node.targetPosition = isHorizontal
      ? ("left" as Position.Left)
      : ("top" as Position.Top)
    node.sourcePosition = isHorizontal
      ? ("right" as Position.Right)
      : ("bottom" as Position.Bottom)

    node.position = {
      x: nodeWithPosition.x - (node.width || 100) / 2,
      y: nodeWithPosition.y - (node.height || 100) / 2,
    }

    return node
  })

  return { nodes, edges, height: g.graph().height || 640 }
}
