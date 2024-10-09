"use client"

import { Button } from "@/components/ui/button"
import { FARCASTER_CHANNEL_ID } from "@/lib/config"
import { PlusIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

interface Props {
  recipient: string
}

export const PostUpdate = (props: Props) => {
  const { recipient } = props

  const [isVisible, setIsVisible] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    setIsVisible(address?.toLowerCase() === recipient.toLowerCase())
  }, [address, recipient])

  if (!isVisible) return null

  return (
    <a
      href={`https://warpcast.com/~/compose?text=&channelKey=${FARCASTER_CHANNEL_ID}`}
      target="_blank"
    >
      <Button>
        <PlusIcon className="mr-1.5 size-4" /> Post Update
      </Button>
    </a>
  )
}
