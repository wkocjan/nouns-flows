"use client"

import { Badge } from "@/components/ui/badge"
import { Currency } from "@/components/ui/currency"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/flows/edge"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import Link from "next/link"
import { memo } from "react"

function GrantNode(props: NodeProps<Node<{ grant: Grant }, "grant">>) {
  const { targetPosition = Position.Left, data, width, height } = props
  const { image, title, monthlyIncomingFlowRate, id } = data.grant

  return (
    <div
      className="pointer-events-auto flex cursor-auto rounded-lg border bg-card p-2.5"
      style={{ width, height }}
    >
      <div className="flex grow flex-col items-center justify-center">
        <Image
          src={getIpfsUrl(image)}
          alt={title}
          width={32}
          height={32}
          className="size-8 rounded-full"
        />
        <h2 className="mt-1 line-clamp-1 text-[13px] font-medium text-card-foreground">
          <Link href={`/item/${id}`} className="duration-100 hover:text-primary">
            {title}
          </Link>
        </h2>

        <div className="mt-2 flex items-center space-x-1">
          <Badge>
            <Currency>{monthlyIncomingFlowRate}</Currency>
            /mo
          </Badge>
        </div>
      </div>

      <Handle
        type="target"
        position={targetPosition}
        isConnectable={false}
        style={{ background: "var(--primary)" }}
      />
    </div>
  )
}

export default memo(GrantNode)
