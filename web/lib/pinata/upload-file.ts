import { createKey } from "./create-key"
import { pinFile } from "./pin-file"

export async function uploadFile(file: File) {
  const key = await createKey()
  if (!key) throw new Error("Failed to create API key")

  return await pinFile(file, key.JWT)
}
