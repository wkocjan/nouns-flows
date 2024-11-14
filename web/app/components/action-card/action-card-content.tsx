"use client"

import { Button } from "@/components/ui/button"
import { DotLoader } from "@/components/ui/dot-loader"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { experimental_useObject as useObject } from "ai/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { GuidanceChat } from "./guidance-chat"
import { guidanceSchema } from "./guidance-utils"

interface Props {
  user?: User
  animated: boolean
  text?: string
  action?: { link?: string; text: string; isChat: boolean }
}

export function ActionCardContent(props: Props) {
  const { user, animated } = props

  const hasSubmitted = useRef(false)

  const { object, submit, isLoading } = useObject({
    api: "/api/action-card",
    schema: guidanceSchema,
  })

  const animatedText = useAnimatedText(props.text || object?.text || "", "char", !animated)

  useEffect(() => {
    if (!hasSubmitted.current && !props.text) {
      submit(`Hello`)
      hasSubmitted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const action = props.action || object?.action
  const text = props.text || object?.text || ""

  return (
    <>
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mb-5 mt-2.5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        {isLoading && <DotLoader />}
        {!isLoading && <Markdown>{animatedText}</Markdown>}
      </div>

      {action?.text && (
        <motion.div animate={animated ? { opacity: [0, 1] } : {}} transition={{ delay: 4.5 }}>
          {action.isChat ? (
            <GuidanceChat user={user} context={text}>
              {action.text}
            </GuidanceChat>
          ) : (
            <Button key={action.link} variant="ai-secondary" size="md">
              <Link href={action.link || "#"}>{action.text}</Link>
            </Button>
          )}
        </motion.div>
      )}
    </>
  )
}
