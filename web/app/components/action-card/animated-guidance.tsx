"use client"

import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/ui/markdown"
import { User } from "@/lib/auth/user"
import { useAnimatedText } from "@/lib/hooks/use-animated-text"
import { experimental_useObject as useObject } from "ai/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { guidanceSchema } from "./guidance-utils"

interface Props {
  user?: User
}

export function AnimatedGuidance(props: Props) {
  const { user } = props
  const hasSubmitted = useRef(false)

  const { object, submit } = useObject({ api: "/api/action-card", schema: guidanceSchema })

  const animatedText = useAnimatedText(object?.text ?? "")

  useEffect(() => {
    if (!hasSubmitted.current) {
      submit(`Hello`)
      hasSubmitted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <>
      <h2 className="text-lg font-semibold text-secondary-foreground">gm {user?.username}</h2>
      <div className="mt-2.5 space-y-4 text-sm text-secondary-foreground/75 [&>*]:leading-loose">
        {animatedText && <Markdown>{animatedText}</Markdown>}
      </div>

      {object?.actions && (
        <motion.div
          className="mt-5 space-x-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5 }}
        >
          {object.actions
            .filter((a) => Boolean(a?.link) && Boolean(a?.text))
            .map((action) => (
              <Button key={action?.link} variant="ai-secondary" size="md">
                <Link href={action?.link || "#"}>{action?.text}</Link>
              </Button>
            ))}
        </motion.div>
      )}
    </>
  )
}
