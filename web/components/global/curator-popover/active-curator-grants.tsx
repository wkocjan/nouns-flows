"use client"

import { cn, getIpfsUrl } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface ActiveCuratorGrant {
  isActive: number
  isDisputed: number
  isResolved: number
  title: string
  image: string
  id: string
}

interface ActiveCuratorGrantsProps {
  grants: ActiveCuratorGrant[]
}

export function ActiveCuratorGrants(props: ActiveCuratorGrantsProps) {
  const { grants } = props

  return (
    <div className="flex flex-col">
      {grants.map((grant) => (
        <ActiveCuratorGrantRow key={grant.title} {...grant} />
      ))}
    </div>
  )
}

function ActiveCuratorGrantRow({ image, title, id }: ActiveCuratorGrant) {
  return (
    <div className="grid grid-cols-3 items-center border-t border-border py-2">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
        <Image
          src={getIpfsUrl(image)}
          alt={title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link href={`/flow/${id}`} className="truncate text-sm hover:underline">
          {title}
        </Link>
      </div>
      <div className="text-center text-sm font-medium">1 day</div>
    </div>
  )
}
