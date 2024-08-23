"use client"

import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

export type IPoolNode = Node<
  {
    name: string
    logoUrl: string
    budget: number
  },
  "pool"
>

function PoolNode(props: NodeProps<IPoolNode>) {
  const { sourcePosition = Position.Bottom, width, height } = props
  const { logoUrl, name, budget } = props.data

  return (
    <div
      className="pointer-events-auto inline-block cursor-auto rounded-lg border bg-card px-6 py-4"
      style={{ width, height }}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          src={logoUrl}
          width={48}
          height={48}
          alt={name}
          className="size-12 rounded-lg"
        />
        <div className="mt-2.5 text-lg font-medium text-card-foreground">
          {name}
        </div>
        <div className="mt-2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
          {Intl.NumberFormat("en", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(budget)}
          /month
        </div>
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={false}
        style={{ background: "var(--color-primary)" }}
      />
    </div>
  )
}

export default memo(PoolNode)
