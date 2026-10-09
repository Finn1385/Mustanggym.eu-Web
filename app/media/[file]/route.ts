import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/paths";

const SAFE_NAME = /^[a-z0-9][a-z0-9-]*\.webp$/;

/** Serves uploaded photos from the persistent volume. Names never change, so they cache forever. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  if (!SAFE_NAME.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
