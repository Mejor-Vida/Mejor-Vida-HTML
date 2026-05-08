/**
 * Nurture timing — single source of truth for api/nurture-cron.js and staff pipeline.
 * Must stay in sync with nurture-cron SCHEDULE_HOURS / MAX_STEPS.
 */

const SCHEDULE_HOURS = {
  1: { 1: 5, 2: 21 },
  2: { 1: 48, 2: 96, 3: 144 },
  3: { 1: 168, 2: 336, 3: 504, 4: 672 },
};

const MAX_STEPS = { 1: 2, 2: 3, 3: 4 };

/** Ordered list of all nurture steps (phase, step). */
function allStepsOrdered() {
  const out = [];
  for (let p = 1; p <= 3; p++) {
    for (let s = 1; s <= MAX_STEPS[p]; s++) {
      out.push({ phase: p, step: s });
    }
  }
  return out;
}

function stepIndex(phase, step) {
  const list = allStepsOrdered();
  const i = list.findIndex((x) => x.phase === phase && x.step === step);
  return i >= 0 ? i : -1;
}

/** Absolute scheduled time for step (phase, step) from enrolled_at. */
function scheduledAtForStep(enrolledAtIso, phase, step) {
  const hours = SCHEDULE_HOURS[phase] && SCHEDULE_HOURS[phase][step];
  if (hours == null) return null;
  const t = new Date(enrolledAtIso).getTime() + hours * 3600000;
  return new Date(t).toISOString();
}

function computeNextSend(currentPhase, currentStep, enrolledAt) {
  let nextPhase = currentPhase;
  let nextStep = currentStep + 1;

  if (nextStep > MAX_STEPS[nextPhase]) {
    nextPhase += 1;
    nextStep = 1;
  }
  if (nextPhase > 3) return { nextPhase: null, nextStep: null, nextSendAt: null };

  const hoursOffset = SCHEDULE_HOURS[nextPhase][nextStep];
  const nextSendAt = new Date(new Date(enrolledAt).getTime() + hoursOffset * 3600000);
  return { nextPhase, nextStep, nextSendAt };
}

module.exports = {
  SCHEDULE_HOURS,
  MAX_STEPS,
  allStepsOrdered,
  stepIndex,
  scheduledAtForStep,
  computeNextSend,
};
