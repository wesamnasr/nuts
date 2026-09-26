import { put, del } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.New_READ_WRITE_TOKEN;

/**
 * Uploads a file to Vercel Blob
 * @param file The file to upload
 * @param options Upload options
 */
export async function uploadToBlob(
  file: File | Buffer,
  filename: string,
  options: {
    folder?: string;
    addRandomSuffix?: boolean;
    contentType?: string;
  } = {},
) {
  const { folder = "uploads", addRandomSuffix = true, contentType } = options;
  
  // Construct path
  const path = folder ? `${folder}/${filename}` : filename;

  try {
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix,
      contentType,
      token: BLOB_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    };
  } catch (error) {
    console.error("Vercel Blob Upload Error:", error);
    throw new Error("Failed to upload image to Vercel storage");
  }
}

/**
 * Deletes a file from Vercel Blob
 * @param url The public URL of the blob to delete
 */
export async function deleteFromBlob(url: string) {
  try {
    await del(url, { token: BLOB_TOKEN });
    return { success: true };
  } catch (error) {
    console.error("Vercel Blob Delete Error:", error);
    return { success: false, error: "Failed to delete image from Vercel storage" };
  }
}

export { BLOB_TOKEN };
