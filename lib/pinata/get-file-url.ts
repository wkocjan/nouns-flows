const gatewayUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}`

export function getIpfsUrl(hash: string) {
  return `https://${gatewayUrl}/ipfs/${hash}`
}
