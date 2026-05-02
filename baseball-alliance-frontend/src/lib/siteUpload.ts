import { api } from "./api";

export async function uploadSiteMedia(
  file: File,
  kind: "image" | "video"
): Promise<string> {
  const { uploadUrl, publicUrl } = await api.presignSiteUpload({
    filename: file.name,
    contentType: file.type,
    kind,
  });
  const put = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!put.ok) {
    const t = await put.text().catch(() => "");
    throw new Error(t || `Upload failed (${put.status})`);
  }
  return publicUrl;
}
