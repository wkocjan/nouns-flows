"use client"

import { Category } from "@/lib/data/categories"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import { memo } from "react"

function CategoryNode(
  props: NodeProps<Node<{ category: Category }, "category">>,
) {
  const {
    targetPosition = Position.Left,
    sourcePosition = Position.Right,
    width,
    height,
    data,
  } = props
  const { title, budget } = data.category

  return (
    <div
      className="pointer-events-auto flex cursor-auto rounded-lg bg-card p-2.5"
      style={{ width, height }}
    >
      <div className="flex grow items-center justify-center">
        <div className="ml-2.5 flex flex-col items-center pr-1.5">
          <h2 className="line-clamp-1 font-medium">
            {/* <Link href={url} className="hover:text-primary duration-100"> */}
            {title}
            {/* </Link> */}
          </h2>

          <div className="mt-2 flex items-center space-x-1">
            <div className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
              {Intl.NumberFormat("en", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(budget)}
              /month
            </div>
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

export default memo(CategoryNode)
