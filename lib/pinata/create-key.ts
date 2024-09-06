"use server"

import { v4 as uuidv4 } from "uuid"

interface KeyResponse {
  pinata_api_key: string
  pinata_api_secret: string
  JWT: string
}

export async function createKey(): Promise<KeyResponse | null> {
  try {
    const response = await fetch("https://api.pinata.cloud/v3/pinata/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        keyName: uuidv4().toString(),
        permissions: { endpoints: { pinning: { pinFileToIPFS: true } } },
        maxUses: 1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create API key")
    }

    const data: KeyResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error creating Pinata API Key:", error)
    return null
  }
}
