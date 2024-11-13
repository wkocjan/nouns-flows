// Define the algorithm once
const algorithm = { name: "AES-GCM", length: 256 }

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
    bytes[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16)
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
export async function encrypt(obj: any): Promise<string> {
  const text = JSON.stringify(obj)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey()

  const encoder = new TextEncoder()
  const encryptedBuffer = await crypto.subtle.encrypt(
    { ...algorithm, iv },
    key,
    encoder.encode(text),
  )

  // Combine IV and encrypted data
  const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combinedBuffer.set(iv, 0)
  combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length)

  // Convert combined data to hex string
  const encryptedHex = arrayBufferToHex(combinedBuffer.buffer)

  return encryptedHex
}

// Decrypt function
export async function decrypt(encryptedHex: string): Promise<any> {
  const combinedBuffer = hexToArrayBuffer(encryptedHex)
  const combinedArray = new Uint8Array(combinedBuffer)

  const iv = combinedArray.slice(0, 12)
  const encryptedData = combinedArray.slice(12)

  const key = await getKey()

  const decryptedBuffer = await crypto.subtle.decrypt({ ...algorithm, iv }, key, encryptedData)

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decryptedBuffer))
}
