const fs = require("fs-extra")
const glob = require("glob")
const path = require("path")

// Define the pattern to match files (e.g., all .ts and .tsx files)
const pattern = "**/*.{ts,tsx}"

// Define the search and replacement strings
const searchString = 'export const runtime = "nodejs"'
const replaceString = 'export const runtime = "edge"'

// Function to process each file
const processFile = (file) => {
  const filePath = path.resolve(file)
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err)
      return
    }
    if (data.includes(searchString)) {
      const result = data.replace(searchString, replaceString)
      fs.writeFile(filePath, result, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err)
        } else {
          console.log(`Updated ${filePath}`)
        }
      })
    }
  })
}

// Execute the script
glob(pattern, (err, files) => {
  if (err) {
    console.error("Error finding files:", err)
    return
  }
  files.forEach(processFile)
})
