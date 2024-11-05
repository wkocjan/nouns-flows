export const cleanTextForEmbedding = (text: string) => {
  return text
    .replace(/\\r\\n/g, " ") // Replace \r\n with space
    .replace(/\\n/g, " ") // Replace \n with space
    .replace(/\\"/g, '"') // Replace escaped quotes
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/#/g, "") // Remove #
    .toLowerCase() // Convert to lowercase
}
