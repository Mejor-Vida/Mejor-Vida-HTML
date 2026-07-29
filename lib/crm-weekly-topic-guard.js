/**
 * Weekly client email / FB post topic guard.
 * Mejor Vida newsletter content must stay on life insurance / final expense only.
 */

const BLOCKED_TOPIC_RE =
  /\b(medicare|medigap|med\s*supp|medicare\s*advantage|part\s*[abcd]\b|medicaid|cms\b|aep\b|open\s*enrollment)\b/i;

const ALLOWED_TOPIC_RE =
  /\b(life\s*insurance|seguro\s*de\s*vida|final\s*expense|gastos\s*finales|burial|funeral|whole\s*life|vida\s*entera|term\s*life|vida\s*a\s*t[eé]rmino|p[oó]liza|beneficiar|unclaimed\s*life|seguro\s*no\s*reclamado)\b/i;

function newsletterTopicText(parts) {
  const p = parts || {};
  return [p.subject, p.email_subject, p.email_caption, p.main_caption, p.bodyHtml, p.heroHtml]
    .filter(Boolean)
    .join("\n");
}

/**
 * @param {string} text
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
function assertLifeOrFinalExpenseTopic(text) {
  const s = String(text || "");
  if (!s.trim()) {
    return { ok: false, error: "Weekly email content is empty." };
  }
  if (BLOCKED_TOPIC_RE.test(s)) {
    return {
      ok: false,
      error:
        "Blocked: weekly newsletter cannot include Medicare, Medigap, Med Supp, or related health-plan topics. Use life insurance or final expense news only.",
    };
  }
  if (!ALLOWED_TOPIC_RE.test(s)) {
    return {
      ok: false,
      error:
        "Blocked: weekly newsletter must clearly relate to life insurance or final expense (seguro de vida / gastos finales).",
    };
  }
  return { ok: true };
}

function assertNewsletterPartsOk(parts) {
  return assertLifeOrFinalExpenseTopic(newsletterTopicText(parts));
}

module.exports = {
  BLOCKED_TOPIC_RE,
  ALLOWED_TOPIC_RE,
  newsletterTopicText,
  assertLifeOrFinalExpenseTopic,
  assertNewsletterPartsOk,
};
