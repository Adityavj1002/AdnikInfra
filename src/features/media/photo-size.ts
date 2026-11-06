/** A photo's pixel size, read in the browser before upload. */
export async function dimensions(file: File): Promise<Readonly<{ width: number; height: number }>> {
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    // HEIC and the like can't be decoded in every browser; Cloudinary reports real sizes anyway.
    return { width: 1600, height: 1200 }
  }
}
