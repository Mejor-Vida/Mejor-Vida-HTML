/**
 * Meta Marketing API — service layer with dry-run support.
 *
 * TODO: Fill in real Graph API calls using:
 *   - META_ACCESS_TOKEN (long-lived system user token with ads_management)
 *   - META_AD_ACCOUNT_ID as act_XXXXXXXXX
 * See: https://developers.facebook.com/docs/marketing-apis/
 *
 * Never log access tokens. All credentials come from environment variables.
 */

export type CampaignDraft = {
  name: string;
  objective: string;
  status: "PAUSED" | "ACTIVE";
};

export type AdSetDraft = {
  name: string;
  dailyBudgetCents?: number;
  targeting?: Record<string, unknown>;
  optimizationGoal?: string;
};

export type CreativeDraft = {
  name: string;
  imageUrlOrHash: string;
  message?: string;
  linkUrl?: string;
  callToActionType?: string;
};

export type AdDraft = {
  name: string;
  creative: CreativeDraft;
};

export type MetaServiceResult<T> =
  | { ok: true; dryRun: boolean; data: T }
  | { ok: false; error: string };

function isDryRunPreferred(): boolean {
  if (!process.env.META_ACCESS_TOKEN?.trim()) return true;
  if (process.env.MVI_ALLOW_LIVE_META === "false") return true;
  return false;
}

export async function createCampaign(
  draft: CampaignDraft,
): Promise<MetaServiceResult<{ campaignId: string }>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: { campaignId: `dry_campaign_${Date.now()}` },
    };
  }
  // TODO: POST /{ad_account_id}/campaigns
  return { ok: false, error: "Live Meta API not implemented yet — set dry run or implement Graph calls." };
}

export async function createAdSet(
  campaignId: string,
  draft: AdSetDraft,
): Promise<MetaServiceResult<{ adSetId: string }>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: { adSetId: `dry_adset_${Date.now()}` },
    };
  }
  // TODO: POST /{ad_account_id}/adsets
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export async function uploadAdImage(
  _filePath: string,
): Promise<MetaServiceResult<{ hash: string }>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: { hash: `dry_img_${Date.now()}` },
    };
  }
  // TODO: POST /{ad_account_id}/adimages
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export async function createAdCreative(
  draft: CreativeDraft,
): Promise<MetaServiceResult<{ creativeId: string }>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: { creativeId: `dry_creative_${Date.now()}` },
    };
  }
  // TODO: POST /{ad_account_id}/adcreatives
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export async function createAd(
  adSetId: string,
  draft: AdDraft,
): Promise<MetaServiceResult<{ adId: string }>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: { adId: `dry_ad_${Date.now()}` },
    };
  }
  // TODO: POST /{ad_account_id}/ads
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export async function setAdStatus(
  adId: string,
  status: "ACTIVE" | "PAUSED",
): Promise<MetaServiceResult<{ adId: string; status: string }>> {
  if (isDryRunPreferred()) {
    return { ok: true, dryRun: true, data: { adId, status } };
  }
  // TODO: POST /{ad_id}
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export async function fetchAdInsights(
  adId: string,
  _datePreset: string = "last_7d",
): Promise<MetaServiceResult<Record<string, string | number>>> {
  if (isDryRunPreferred()) {
    return {
      ok: true,
      dryRun: true,
      data: {
        impressions: 0,
        clicks: 0,
        spend: 0,
        ctr: 0,
        cpc: 0,
        actions: 0,
        ad_id: adId,
      },
    };
  }
  // TODO: GET /{ad_id}/insights
  return { ok: false, error: "Live Meta API not implemented yet." };
}

export function metaEnvConfigured(): boolean {
  return Boolean(
    process.env.META_ACCESS_TOKEN?.trim() &&
      process.env.META_AD_ACCOUNT_ID?.trim(),
  );
}
