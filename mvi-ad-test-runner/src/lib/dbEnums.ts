/** Mirrors DB string columns — keep in sync with Prisma schema comments. */

export const RoundTypes = ["HOOK_TEST", "IMAGE_TEST", "TEMPLATE_TEST"] as const;
export type RoundType = (typeof RoundTypes)[number];

export const RoundStatuses = [
  "DRAFT",
  "READY",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "WINNER_SELECTED",
] as const;
export type RoundStatus = (typeof RoundStatuses)[number];

export const ScheduleModes = ["SIMULTANEOUS", "STAGGERED", "SEQUENTIAL"] as const;
export type ScheduleMode = (typeof ScheduleModes)[number];

export const PrimaryMetrics = [
  "CTR",
  "CPC",
  "COST_PER_WHATSAPP",
  "AMOUNT_SPENT",
  "IMPRESSIONS",
  "CLICKS",
  "CONVERSATIONS_STARTED",
  "CONVERSION_RATE",
  "WEIGHTED",
] as const;
export type PrimaryMetric = (typeof PrimaryMetrics)[number];
