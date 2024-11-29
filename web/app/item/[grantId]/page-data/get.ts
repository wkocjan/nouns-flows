import database from "@/lib/database/edge"
import { generateGrantPageData } from "./generate"

export async function generateAndStoreGrantPageData(grantId: string) {
  try {
    console.debug(`Generating grant page data for ${grantId}`)

    const data = await generateGrantPageData(grantId)
    if (!data) throw new Error("Failed to generate grant page data")

    const existing = await database.derivedData.findUnique({ where: { grantId } })

    if (existing) {
      await database.derivedData.update({
        where: { grantId },
        data: { pageData: JSON.stringify(data) },
      })
    } else {
      await database.derivedData.create({ data: { grantId, pageData: JSON.stringify(data) } })
    }

    console.debug(`Generated and stored grant page data for ${grantId}`)
    return data
  } catch (error) {
    console.error((error as any).message, { grantId })
    return null
  }
}
