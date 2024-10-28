"use client" // Error components must be Client Components

import { appRouterSsrErrorHandler, AppRouterErrorProps } from "@highlight-run/next/ssr"
import Image from "next/image"

export default appRouterSsrErrorHandler(({ error, reset }: AppRouterErrorProps) => {
  console.error(error)

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Sorry about that. Something went wrong!</h2>
      <Image
        src="https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif"
        alt="Dancing cat"
        width={300}
        height={300}
      />
      <button
        onClick={
          () => reset() // Attempt to recover by trying to re-render the segment
        }
      >
        Try again
      </button>
    </div>
  )
})
