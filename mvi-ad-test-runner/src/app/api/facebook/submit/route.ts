import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { FacebookSubmitBody } from "@/lib/api/validation";
import {
  createAd,
  createAdSet,
  createCampaign,
  createAdCreative,
  metaEnvConfigured,
  uploadAdImage,
} from "@/lib/facebook/metaMarketingService";
import path from "path";
import fs from "fs";
import { getDataRoot } from "@/lib/paths";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = FacebookSubmitBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { roundId, confirmLive } = parsed.data;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { variants: { orderBy: { sortOrder: "asc" } }, project: true },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const liveAllowed = process.env.MVI_ALLOW_LIVE_META !== "false" && metaEnvConfigured();
  const dryRun = !liveAllowed || !confirmLive;

  if (!dryRun && !confirmLive) {
    return NextResponse.json(
      { error: "Live submission requires confirmLive: true" },
      { status: 400 },
    );
  }

  const fingerprint = crypto
    .createHash("sha256")
    .update(`${roundId}:${round.variants.map((v) => v.id).join(",")}`)
    .digest("hex");

  if (!dryRun) {
    const dup = await prisma.facebookSubmission.findFirst({
      where: { roundId, dryRun: false, fingerprint },
    });
    if (dup) {
      return NextResponse.json(
        {
          error:
            "A live submission for this round configuration already exists. Pause or adjust before launching again.",
          duplicateId: dup.id,
        },
        { status: 409 },
      );
    }
  }

  const payload: Record<string, unknown> = {
    project: round.project.name,
    round: round.name,
    dryRun,
    variants: [],
  };

  const campaign = await createCampaign({
    name: `MVI — ${round.project.name} — ${round.name}`,
    objective: "OUTCOME_TRAFFIC",
    status: "PAUSED",
  });
  if (!campaign.ok) {
    return NextResponse.json({ error: campaign.error }, { status: 500 });
  }

  const adset = await createAdSet(campaign.data.campaignId, {
    name: `${round.name} · ad set`,
  });
  if (!adset.ok) {
    return NextResponse.json({ error: adset.error }, { status: 500 });
  }

  const variantPayloads: object[] = [];

  for (const v of round.variants) {
    let imagePath = v.imagePath
      ? path.join(getDataRoot(), v.imagePath)
      : null;
    if (imagePath && !fs.existsSync(imagePath)) {
      imagePath = null;
    }

    const img = imagePath
      ? await uploadAdImage(imagePath)
      : { ok: true as const, dryRun: true, data: { hash: "dry_missing_image" } };

    const creative = await createAdCreative({
      name: v.label ?? v.hookText?.slice(0, 40) ?? "creative",
      imageUrlOrHash: img.ok ? img.data.hash : "missing",
      message: v.hookText ?? "",
    });

    const ad = await createAd(adset.data.adSetId, {
      name: v.label ?? "ad",
      creative: {
        name: v.label ?? "creative",
        imageUrlOrHash: img.ok ? img.data.hash : "",
      },
    });

    variantPayloads.push({
      variantId: v.id,
      creative,
      ad,
      imageUploaded: img.ok,
    });
  }

  payload.variants = variantPayloads;

  const sub = await prisma.facebookSubmission.create({
    data: {
      roundId,
      status: dryRun ? "dry_run_complete" : "sent",
      dryRun,
      payload: JSON.stringify(payload),
      fingerprint,
    },
  });

  await prisma.round.update({
    where: { id: roundId },
    data: { status: "RUNNING" },
  });

  return NextResponse.json({ submission: sub, payload });
}
