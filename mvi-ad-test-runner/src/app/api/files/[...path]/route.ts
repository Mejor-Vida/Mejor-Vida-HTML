import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDataRoot } from "@/lib/paths";

export const runtime = "nodejs";

/**
 * Serve files from the managed data directory (PNG previews, imported HTML).
 * Prevents path traversal outside `data/`.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const root = getDataRoot();
  const abs = path.normalize(path.join(root, ...segments));
  if (!abs.startsWith(root)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const type =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".html"
          ? "text/html; charset=utf-8"
          : "application/octet-stream";

  return new NextResponse(buf, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
