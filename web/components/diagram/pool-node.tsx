"use client"

import { Currency } from "@/components/ui/currency"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

export type IPoolNode = Node<{ pool: Grant }, "pool">

function PoolNode(props: NodeProps<IPoolNode>) {
  const { sourcePosition = Position.Bottom, width, height } = props
  const { image, title, monthlyOutgoingFlowRate } = props.data.pool

  return (
    <div
      className="pointer-events-auto inline-block cursor-auto rounded-lg border bg-card px-6 py-4"
      style={{ width, height }}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          src={getIpfsUrl(image)}
          width={48}
          height={48}
          alt={title}
          className="size-12 rounded-lg"
        />
        <div className="mt-2.5 text-lg font-medium text-card-foreground">{title}</div>
        <div className="mt-2 rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
          <Currency>{monthlyOutgoingFlowRate}</Currency>
          /mo
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
