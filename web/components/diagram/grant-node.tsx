"use client"

import { Badge } from "@/components/ui/badge"
import { getIpfsUrl } from "@/lib/utils"
import { Grant } from "@prisma/client"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

function GrantNode(props: NodeProps<Node<{ grant: Grant }, "grant">>) {
  const { targetPosition = Position.Left, data, width, height } = props
  const { image, title } = data.grant

  const budget = "123"

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
          {/* <Link href={url} className="hover:text-primary duration-100"> */}
          {title}
          {/* </Link> */}
        </h2>

        <div className="mt-2 flex items-center space-x-1">
          <Badge>
            {Intl.NumberFormat("en", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(budget)}
            /month
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
