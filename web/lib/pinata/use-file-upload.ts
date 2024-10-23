"use client"

import { useState } from "react"
import { toast } from "sonner"
import { uploadFile } from "./upload-file"

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false)

  return {
    isUploading,
    uploadFile: async (file: File) => {
      try {
        if (!file) throw new Error("Please upload file")
        setIsUploading(true)

        return await uploadFile(file)
      } catch (error) {
        console.error("Upload error:", error)
        toast.error((error as Error).message || "Couldn't upload file")
        return null
      } finally {
        setIsUploading(false)
      }
    },
  }
}
