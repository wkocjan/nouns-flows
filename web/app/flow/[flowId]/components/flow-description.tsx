"use client"

import { Button } from "@/components/ui/button"
import { CardDescription, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Markdown } from "@/components/ui/markdown"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useState } from "react"

interface Props {
  tagline: string | null
  description: string
  title: string
}

export const FlowDescription = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const { tagline, description, title } = props

  return (
    <div>
      <CardTitle className="text-xl font-bold">{title}</CardTitle>
      <CardDescription className="text-sm">{tagline}</CardDescription>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="link" size="sm" className="p-0">
            <ChevronDownIcon
              className={cn("mr-2 size-4 transition-transform", {
                "-rotate-180": isOpen,
              })}
            />
            Show {isOpen ? "less" : "more"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 pt-2 text-sm">
            <Markdown>{description}</Markdown>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
