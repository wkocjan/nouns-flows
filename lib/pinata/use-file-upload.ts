"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createKey } from "./create-key"
import { pinFile } from "./pin-file"

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const uploadFile = async (file: File) => {
    try {
      if (!file) throw new Error("Please upload file")
      setIsUploading(true)

      const key = await createKey()
      if (!key) throw new Error("Failed to create API key")

      return await pinFile(file, key.JWT)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error((error as Error).message || "Couldn't upload file")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    uploadFile,
  }
}
