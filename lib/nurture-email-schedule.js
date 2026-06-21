/**
 * Staff-scheduled nurture email dates (Phase 3, steps 1–4).
 */

const { scheduledAtForStep, computeNextSend } = require("./nurture-schedule");

const WEEK_NAMES = [
  "Email — Week 1",
  "Email — Week 2",
  "Email — Week 3",
  "Email — Week 4",
];

function weekName(step) {
  return WEEK_NAMES[step - 1] || `Email — Week ${step}`;
}

function defaultScheduleFromEnrolled(enrolledAtIso) {
  const out = {};
  for (let step = 1; step <= 4; step++) {
    out[step] = scheduledAtForStep(enrolledAtIso, 3, step);
  }
  return out;
}

function defaultScheduleFromNow(now) {
  const base = now instanceof Date ? now : new Date(now || Date.now());
  const out = {};
  for (let step = 1; step <= 4; step++) {
    const d = new Date(base.getTime() + step * 7 * 24 * 3600000);
    out[step] = d.toISOString();
  }
  return out;
}

function scheduleMapFromRows(rows) {
  const out = {};
  for (const row of rows || []) {
    if (row && row.step >= 1 && row.step <= 4 && row.scheduled_at) {
      out[row.step] = row.scheduled_at;
    }
  }
  return out;
}

function mergeSchedule(defaults, saved) {
  const out = { ...(defaults || {}) };
  for (let step = 1; step <= 4; step++) {
    if (saved && saved[step]) out[step] = saved[step];
  }
  return out;
}

function isStepSent(deliveryLogs, step) {
  return (deliveryLogs || []).some(
    (log) =>
      Number(log.phase) === 3 &&
      Number(log.step) === step &&
      String(log.status || "").toLowerCase() === "sent"
  );
}

function firstPendingEmailStep(deliveryLogs, scheduleByStep) {
  for (let step = 1; step <= 4; step++) {
    if (isStepSent(deliveryLogs, step)) continue;
    const at = scheduleByStep && scheduleByStep[step];
    if (at) return { step, scheduledAt: new Date(at) };
  }
  return null;
}

function computeNextSendWithSchedule(currentPhase, currentStep, enrolledAt, scheduleByStep) {
  if (currentPhase === 3) {
    const nextStep = currentStep + 1;
    if (nextStep > 4) {
      return { nextPhase: null, nextStep: null, nextSendAt: null };
    }
    const custom = scheduleByStep && scheduleByStep[nextStep];
    if (custom) {
      return {
        nextPhase: 3,
        nextStep,
        nextSendAt: new Date(custom),
      };
    }
  }
  return computeNextSend(currentPhase, currentStep, enrolledAt);
}

module.exports = {
  WEEK_NAMES,
  weekName,
  defaultScheduleFromEnrolled,
  defaultScheduleFromNow,
  scheduleMapFromRows,
  mergeSchedule,
  isStepSent,
  firstPendingEmailStep,
  computeNextSendWithSchedule,
};
