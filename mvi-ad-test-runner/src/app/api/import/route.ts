import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { importInboxDir, ensureDir } from "@/lib/paths";
import { parseHeadlinesFromStandaloneHtml } from "@/lib/import/bundlerParser";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Multipart upload of Claude Design standalone HTML.
 * Stores a copy under data/imports/inbox/ and parses HEADLINES for variant rows.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Expected form field `file`" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const html = buf.toString("utf8");

    const headlines = parseHeadlinesFromStandaloneHtml(html);
    if (headlines.length === 0) {
      return NextResponse.json({ error: "No HEADLINES found in file" }, { status: 422 });
    }

    ensureDir(importInboxDir());
    const safeName = path.basename(file.name || "standalone.html").replace(/[^\w.\- ()]/g, "_");
    const storedName = `${Date.now()}_${safeName}`;
    const storedPath = path.join(importInboxDir(), storedName);
    fs.writeFileSync(storedPath, buf);

    const imp = await prisma.importSource.create({
      data: {
        originalName: file.name || "standalone.html",
        storedPath,
        headlines: JSON.stringify(headlines),
      },
    });

    return NextResponse.json({
      importId: imp.id,
      headlineCount: headlines.length,
      headlines,
      storedPath: imp.storedPath,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
