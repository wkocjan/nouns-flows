import { saveItem, getItem } from "./kvStore"

// Define the algorithm once
const algorithm = { name: "AES-CBC", length: 256 }

// Helper functions for conversions
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer)
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function hexToArrayBuffer(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(hexString.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return bytes.buffer
}

// Get the key as a CryptoKey object
async function getKey(): Promise<CryptoKey> {
  const keyBase64 = process.env.VOTES_ENCRYPTION_KEY || ""
  const keyBuffer = base64ToArrayBuffer(keyBase64)
  return crypto.subtle.importKey("raw", keyBuffer, algorithm, false, ["encrypt", "decrypt"])
}

// Encrypt function
export async function encrypt(obj: any, uniqueKey: string): Promise<string> {
  const text = JSON.stringify(obj)
  const iv = crypto.getRandomValues(new Uint8Array(16))
  const key = await getKey()

  const encoder = new TextEncoder()
  const encryptedBuffer = await crypto.subtle.encrypt(
    { ...algorithm, iv },
    key,
    encoder.encode(text),
  )

  // Convert encrypted data and IV to hex strings
  const encryptedHex = arrayBufferToHex(encryptedBuffer)
  const ivHex = arrayBufferToHex(iv.buffer)

  // Store the IV
  await saveItem(`iv:${uniqueKey}`, ivHex)

  return encryptedHex
}

// Decrypt function
export async function decrypt(encryptedHex: string, uniqueKey: string): Promise<any> {
  const ivHex = await getItem<string>(`iv:${uniqueKey}`)
  if (!ivHex) {
    throw new Error("IV not found for the given key")
  }

  const ivBuffer = hexToArrayBuffer(ivHex)
  const iv = new Uint8Array(ivBuffer)
  const key = await getKey()

  const encryptedBuffer = hexToArrayBuffer(encryptedHex)

  const decryptedBuffer = await crypto.subtle.decrypt({ ...algorithm, iv }, key, encryptedBuffer)

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decryptedBuffer))
}
