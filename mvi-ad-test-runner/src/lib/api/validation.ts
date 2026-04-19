import { z } from "zod";
import {
  PrimaryMetrics,
  RoundStatuses,
  RoundTypes,
  ScheduleModes,
} from "@/lib/dbEnums";

export const RoundTypeSchema = z.enum(RoundTypes);
export const RoundStatusSchema = z.enum(RoundStatuses);
export const ScheduleModeSchema = z.enum(ScheduleModes);
export const PrimaryMetricSchema = z.enum(PrimaryMetrics);

export const CreateProjectBody = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const CreateHookRoundBody = z.object({
  name: z.string().min(1).max(200),
  objective: z.string().max(5000).optional(),
  importId: z.string().min(1),
  primaryMetric: PrimaryMetricSchema.optional(),
});

export const UpdateRoundBody = z.object({
  name: z.string().min(1).max(200).optional(),
  objective: z.string().max(5000).optional().nullable(),
  status: RoundStatusSchema.optional(),
  audience: z.record(z.string(), z.unknown()).optional(),
  budget: z.record(z.string(), z.unknown()).optional(),
  schedule: z.record(z.string(), z.unknown()).optional(),
  scheduleMode: ScheduleModeSchema.optional(),
  primaryMetric: PrimaryMetricSchema.optional(),
  metricWeights: z.record(z.string(), z.number()).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
});

export const MetricsBody = z.object({
  variantId: z.string(),
  metrics: z.object({
    impressions: z.number().optional(),
    clicks: z.number().optional(),
    amountSpent: z.number().optional(),
    ctr: z.number().optional(),
    cpc: z.number().optional(),
    conversationsStarted: z.number().optional(),
    conversionRate: z.number().optional(),
  }),
});

export const SelectWinnerBody = z.object({
  variantId: z.string(),
});

export const NextRoundBody = z.object({
  name: z.string().min(1),
  type: RoundTypeSchema,
  testVariable: z.string().min(1).max(120),
});

export const FacebookSubmitBody = z.object({
  roundId: z.string(),
  confirmLive: z.boolean().default(false),
});
