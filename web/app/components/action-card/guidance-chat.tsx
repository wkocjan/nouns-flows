"use client"

import { useAgentChat } from "@/app/chat/components/agent-chat"
import { Messages } from "@/app/chat/components/messages"
import { MultimodalInput } from "@/app/chat/components/multimodal-input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User } from "@/lib/auth/user"
import { RotateCcw } from "lucide-react"
import { useState } from "react"

interface Props {
  user?: User
}

export function GuidanceChat(props: Props) {
  const { user } = props
  const [isOpen, setIsOpen] = useState(false)
  const { append, messages, restart } = useAgentChat()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ai-secondary"
        size="md"
        type="button"
        onClick={() => {
          setIsOpen(true)
          if (messages.length === 0) append({ role: "user", content: "Hello!" })
        }}
      >
        Tell me more
      </Button>
      <DialogContent className="max-w-none pb-0 max-sm:px-0">
        <DialogHeader className="max-sm:px-4">
          <DialogTitle className="flex items-center">
            Conversation with Flo
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={restart}
              className="ml-2.5 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(100dvh-100px)] min-w-0 flex-col">
          {user && messages.length > 0 && <Messages />}
          <MultimodalInput />
        </div>
      </DialogContent>
    </Dialog>
  )
}
