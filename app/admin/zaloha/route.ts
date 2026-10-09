import { Readable } from "node:stream";
import { getAuth } from "@/lib/auth";
import { backupFileName, createBackupStream } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const stream = createBackupStream();
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${backupFileName()}"`,
      "Cache-Control": "no-store",
    },
  });
}
