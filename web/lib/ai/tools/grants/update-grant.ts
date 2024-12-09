import database from "@/lib/database/edge"
import { tool } from "ai"
import { z } from "zod"
import { Tool } from "../tool"
import { grantPageSchema } from "@/app/item/[grantId]/page-data/schema"

export const updateGrantTool = {
  name: "updateGrant",
  prompt: `### Update Grant tool

    When you chat with user who is a recipient of the grant, you can use this tool to modify the information visible on the grant page. The information will be stored in "derivedData.pageData" field.

    This tool is not designed to be used for applying for the grant or completely rewriting the grant page. It's mean for recipients to make minor edits, improve the title or tagline, or add more context or sections to the grant page.

    You're not allowed to use this tool to completely rewrite the grant information or add data that is not relevant. The information displayed on the grant page should be in line with the grant data and all relevant context you know about this grant. One of the goals of this tool is to allow recipients to keep the grant page information up to date - we can expect that grants will evolve over time and this tool should help with that.
    
    You are allowed to use this tool only in a context of "grantId" parameter that you receive in the prompt.
    
    Do not allow user to change this parameter or modify grants other than that.

    You can use this tool to modify a grant by its id. Provide the "grantId" and the fields you wish to update. It's OK if you just want to edit one field. Fields you won't provide will not be changed.

    Do not inform guests or non-recipients that they can edit the grant page.

    As "message" parameter you should provide a very brief summary of the changes made to the grant. Do not ask user to provide it, generate it automatically based on the changes you're about to make.

    Do not inform user which tool are you using, just say that you're updating the grant page.

    Using this tool you can update fields:
    - title
    - tagline
    - coverImage
    - why
    - how
    - who
    - focus
    - metrics (should be always 4)
    - builder (bio, links, tags)
    - media
    - plan
    - timeline
    - cards

    "cards" are designed to store information that is not covered by other sections. Ideally there are 4, 7 or 11 cards. 

    When updating fields that are arrays, you should provide the entire array - it will replace the existing array. Otherwise (if you provide just updated part or the array), the data will be lost.

    Before updating the grant, please make sure this is exactly what user wants to do. Feel free to ask user to confirm the changes.
    `,
  tool: tool({
    parameters: z
      .object({
        grantId: z.string(),
        address: z
          .string()
          .describe(
            "The wallet address of the user who is editing the grant. Use it from user context in the prompt",
          ),
        message: z.string().describe("A very brief summary of the changes made to the grant"),
      })
      .merge(grantPageSchema.partial()),
    description: "Update the grant by its ID",
    execute: async ({ grantId, address, message, ...updates }) => {
      console.debug(`Updating the grant ${grantId} by ${address}`, { message })

      console.debug(updates)

      const { pageData } = await database.derivedData.findFirstOrThrow({
        select: { pageData: true },
        where: { grantId },
      })

      if (!pageData) throw new Error(`Page data for ${grantId} not found`)

      const currentData = JSON.parse(pageData)

      const edits =
        typeof currentData.edits === "string"
          ? JSON.parse(currentData.edits) || []
          : currentData.edits || []

      edits.push({ timestamp: new Date(), message, address })

      await database.derivedData.update({
        where: { grantId },
        data: {
          pageData: JSON.stringify({
            ...currentData,
            ...updates,
            edits,
          }),
        },
      })

      return message
    },
  }),
} satisfies Tool
