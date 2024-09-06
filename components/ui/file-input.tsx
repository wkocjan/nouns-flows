"use client"

import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/lib/pinata/use-file-upload"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  name: string
  accept: string
  onSuccess?: (hash: string) => void
  maxFileSizeMB?: number
}

export function FileInput({
  name,
  accept,
  onSuccess,
  maxFileSizeMB = 2,
}: Props) {
  const { isUploading, uploadFile } = useFileUpload()
  const [hash, setHash] = useState<string>()

  return (
    <>
      <Input
        type="file"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return

          if (file.size > maxFileSizeMB * 1024 * 1024) {
            toast.error(`Max file size is ${maxFileSizeMB}MB`)
            return
          }

          const hash = await uploadFile(file)

          if (hash) {
            setHash(hash)
            if (onSuccess) onSuccess(hash)
          }
        }}
        accept={accept}
        disabled={isUploading}
      />
      <input type="hidden" name={name} value={hash} />
    </>
  )
}
