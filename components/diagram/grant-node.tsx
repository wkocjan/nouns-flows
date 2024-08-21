"use client"

import { Grant } from "@/lib/data/grants"
import { Handle, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

function GrantNode(props: NodeProps<Node<{ grant: Grant }, "grant">>) {
  const { targetPosition = Position.Left, data, width, height } = props
  const { imageUrl, title, tagline, budget } = data.grant

  return (
    <div
      className="pointer-events-auto flex cursor-auto rounded-lg bg-card p-2.5"
      style={{ width, height }}
    >
      <div className="flex grow flex-col items-center justify-center">
        <Image
          src={imageUrl}
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
        {/* <div className="line-clamp-2 max-w-48 text-xs text-card-foreground/70">
            {tagline}
          </div> */}
        <div className="mt-2 flex items-center space-x-1">
          <div className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-medium text-primary-foreground">
            {Intl.NumberFormat("en", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(budget)}
            /month
          </div>
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
