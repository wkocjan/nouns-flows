export async function updateGrantPage(grantId: string) {
  const webhookUrl = process.env.GRANT_PAGE_UPDATE_URL

  if (!webhookUrl || !webhookUrl.startsWith("http")) return

  const response = await fetch(`${webhookUrl}?grantId=${grantId}`, {
    headers: { "Cache-Control": "no-store" },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update grant page: ${error}`)
  }

  const result = await response.json()
  console.debug(`Updated grant page for ${grantId}`, result)
  return result
}
