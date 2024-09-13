"use server"

import { NOUNS_SUBGRAPH_ID } from "../config"

const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_API_KEY}/subgraphs/id/${NOUNS_SUBGRAPH_ID}`

export async function fetchDelegatedTokens(address: string) {
  const query = `
    query {
      delegate(id: "${address}") {
        nounsRepresented {
          id
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

  const data: SubgraphResponse = await response.json()

  if (data.errors) {
    console.error(data.errors)
    throw new Error(`Subgraph query error: ${data.errors[0].message}`)
  }

  return data.data.delegate?.nounsRepresented.map((noun) => noun.id) || []
}

interface SubgraphResponse {
  data: { delegate: { nounsRepresented: Array<{ id: string }> } }
  errors?: Array<{ message: string }>
}
