"use server"

import * as crypto from "crypto"
import { saveItem, getItem } from "./kvStore"

const algorithm = "aes-256-cbc"
const key = Buffer.from(process.env.VOTES_ENCRYPTION_KEY || "", "base64")

export async function encrypt(obj: any, uniqueKey: string): Promise<string> {
  const text = JSON.stringify(obj)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  // Store the IV
  await saveItem(`iv:${uniqueKey}`, iv.toString("hex"))

  return encrypted
}

export async function decrypt(text: string, uniqueKey: string): Promise<any> {
  const ivHex = await getItem<string>(`iv:${uniqueKey}`)
  if (!ivHex) {
    throw new Error("IV not found for the given key")
  }

  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(text, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return JSON.parse(decrypted)
}
