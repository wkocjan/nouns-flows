export function isVideoFile(file: File) {
  return file.type.startsWith("video/")
}
