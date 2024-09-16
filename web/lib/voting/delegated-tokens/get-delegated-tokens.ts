"use server"

import { NOUNS_SUBGRAPH_ID } from "@/lib/config"
import { getEthAddress } from "@/lib/utils"

const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_API_KEY}/subgraphs/id/${NOUNS_SUBGRAPH_ID}`

export async function fetchDelegatedTokens(address: string) {
  // For testing - wojciech.eth
  if (address === "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52") {
    return [{ id: 1, owner: "0x6cc34d9fb4ae289256fc1896308d387aee2bcc52" as const }]
  }

  // For testing - rocketman21.eth
  if (address === "0x289715ffbb2f4b482e2917d2f183feab564ec84f") {
    return [
      { id: 0, owner: "0x289715ffbb2f4b482e2917d2f183feab564ec84f" as const },
      { id: 2, owner: "0x289715ffbb2f4b482e2917d2f183feab564ec84f" as const },
    ]
  }

  const query = `
    query {
      delegate(id: "${address}") {
        nounsRepresented {
          id
          owner {
            id
          }
        }
      }
    }
  `

  const response = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) throw new Error(`Subgraph API error: ${response.status}`)

  const json: {
    data: { delegate: { nounsRepresented: Array<{ id: string; owner: { id: string } }> } }
    errors?: Array<{ message: string }>
  } = await response.json()

  if (json.errors) {
    console.error(json.errors)
    throw new Error(`Subgraph query error: ${json.errors[0].message}`)
  }

  if (!json.data.delegate?.nounsRepresented) return []

  return json.data.delegate.nounsRepresented.map((noun) => ({
    id: noun.id,
    owner: getEthAddress(noun.owner.id),
  }))
}
