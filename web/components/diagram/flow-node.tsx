"use client"

import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { Grant } from "@prisma/client"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Link from "next/link"
import { memo } from "react"

function FlowNode(props: NodeProps<Node<{ flow: Grant }, "flow">>) {
  const {
    targetPosition = Position.Left,
    sourcePosition = Position.Right,
    width,
    height,
    data,
  } = props
  const { title, id, monthlyFlowRate } = data.flow

  return (
    <div
      className="pointer-events-auto flex cursor-auto rounded-lg border bg-card p-2.5"
      style={{ width, height }}
    >
      <div className="flex grow items-center justify-center">
        <div className="ml-2.5 flex flex-col items-center pr-1.5">
          <h2 className="line-clamp-1 font-medium">
            <Link href={`/flow/${id}`} className="duration-100 hover:text-primary">
              {title}
            </Link>
          </h2>

          <div className="mt-2 flex items-center space-x-1">
            <Badge>
              <Currency>{monthlyFlowRate}</Currency>
              /mo
            </Badge>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={targetPosition}
        isConnectable={false}
        style={{ background: "var(--primary)" }}
      />

      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={false}
        style={{ background: "var(--primary)" }}
      />
    </div>
  )
}

export default memo(FlowNode)
