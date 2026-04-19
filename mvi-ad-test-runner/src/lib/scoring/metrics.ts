import type { PrimaryMetric } from "@/lib/dbEnums";

/** Unified performance metrics (manual entry or future Insights sync). */
export type PerformanceMetrics = {
  impressions?: number;
  clicks?: number;
  amountSpent?: number;
  ctr?: number; // 0–100 or 0–1 — normalized below
  cpc?: number;
  conversationsStarted?: number;
  conversionRate?: number; // 0–100 or 0–1
};

export function normalizeCtr(ctr: number | undefined): number | undefined {
  if (ctr === undefined) return undefined;
  return ctr > 1 ? ctr / 100 : ctr;
}

export function normalizeRate(rate: number | undefined): number | undefined {
  if (rate === undefined) return undefined;
  return rate > 1 ? rate / 100 : rate;
}

export function costPerConversation(
  spend: number | undefined,
  conv: number | undefined,
): number | undefined {
  if (spend === undefined || conv === undefined || conv <= 0) return undefined;
  return spend / conv;
}

export function computeWeightedScore(
  m: PerformanceMetrics,
  weights: Partial<Record<keyof PerformanceMetrics, number>>,
): number {
  let sum = 0;
  let wsum = 0;
  const ctr = normalizeCtr(m.ctr);
  const convRate = normalizeRate(m.conversionRate);
  const cpc = m.cpc;
  const cpaConv = costPerConversation(m.amountSpent, m.conversationsStarted);

  const parts: Partial<Record<string, number>> = {
    ctr: ctr ?? 0,
    cpc: cpc !== undefined ? 1 / (1 + cpc) : 0, // lower CPC → higher score
    costPerWhatsApp:
      cpaConv !== undefined ? 1 / (1 + cpaConv) : 0,
    amountSpent: m.amountSpent !== undefined ? Math.log1p(m.amountSpent) : 0,
    impressions: m.impressions !== undefined ? Math.log1p(m.impressions) : 0,
    clicks: m.clicks !== undefined ? Math.log1p(m.clicks) : 0,
    conversationsStarted: m.conversationsStarted !== undefined ? Math.log1p(m.conversationsStarted) : 0,
    conversionRate: convRate ?? 0,
  };

  for (const [k, w] of Object.entries(weights)) {
    if (!w) continue;
    const v = parts[k];
    if (v === undefined) continue;
    sum += v * w;
    wsum += Math.abs(w);
  }
  if (wsum === 0) return 0;
  return sum / wsum;
}

export function primaryMetricValue(
  primary: PrimaryMetric,
  m: PerformanceMetrics,
): number | undefined {
  switch (primary) {
    case "CTR":
      return normalizeCtr(m.ctr);
    case "CPC":
      return m.cpc;
    case "COST_PER_WHATSAPP":
      return costPerConversation(m.amountSpent, m.conversationsStarted);
    case "AMOUNT_SPENT":
      return m.amountSpent;
    case "IMPRESSIONS":
      return m.impressions;
    case "CLICKS":
      return m.clicks;
    case "CONVERSATIONS_STARTED":
      return m.conversationsStarted;
    case "CONVERSION_RATE":
      return normalizeRate(m.conversionRate);
    case "WEIGHTED":
      return undefined;
    default:
      return undefined;
  }
}

/** Lower-is-better metrics — winner selection should pick minimum. */
export function isLowerBetter(primary: PrimaryMetric): boolean {
  return primary === "CPC" || primary === "COST_PER_WHATSAPP";
}
