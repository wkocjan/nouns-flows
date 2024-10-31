"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Noggles from "@/public/noggles.svg"

interface Props {
  error: Error
  onRetry?: () => void
  buttonText: string
}

export function ErrorMessage({ error, onRetry, buttonText }: Props) {
  return (
    <div className="group/message mx-auto w-full max-w-full px-4 animate-in fade-in slide-in-from-bottom-1 md:max-w-3xl">
      <div className="flex w-full max-w-full gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full p-2 ring-1 ring-border md:size-10">
          <Image src={Noggles} alt="Noggles" width={32} height={32} className="h-full w-full" />
        </div>
        <div className="flex w-full flex-col gap-2 rounded-xl bg-destructive/10 p-3 shadow md:px-5 md:py-3.5">
          <div className="flex flex-col gap-4 whitespace-pre-wrap break-words text-sm leading-6">
            <p>Oops! Sorry, it looks like there was an error.</p>
            {error.message && (
              <p className="text-xs text-muted-foreground">Error: {error.message}</p>
            )}
            {onRetry && (
              <Button variant="destructive" size="sm" onClick={onRetry}>
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
