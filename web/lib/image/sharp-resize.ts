import sharp from "sharp"

const maxImageSize = 4 * 1024 * 1024 // 4 MB

// Function to fetch and resize image
export async function getResizedImage(
  url: string,
): Promise<{ type: "image"; image: string } | null> {
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    // Resize image if it's larger than 5 MB
    if (buffer.byteLength > maxImageSize) {
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 700 }) // Adjust width as needed
        .jpeg({ quality: 70 })
        .toBuffer()

      if (resizedBuffer.byteLength <= maxImageSize) {
        return {
          type: "image" as const,
          image: `data:image/jpeg;base64,${resizedBuffer.toString("base64")}`,
        }
      } else {
        console.warn(`Resized image ${url} still exceeds 5 MB and was skipped.`)
        return null
      }
    } else {
      return { type: "image" as const, image: url }
    }
  } catch (error) {
    console.error(`Failed to process image ${url}:`, error)
    return null
  }
}
