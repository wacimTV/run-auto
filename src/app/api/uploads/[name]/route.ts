import { getUploadMime, readUploadedImage } from "@/lib/upload";

export async function GET(
  _req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const buf = await readUploadedImage(name);
  if (!buf) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": getUploadMime(name),
      // Nom de fichier unique à chaque envoi : peut être mis en cache longtemps
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
