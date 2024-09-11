const gatewayUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}`

export function getPinataUrl(hash: string) {
  return `https://${gatewayUrl}/ipfs/${hash.replace("ipfs://", "")}`
}
