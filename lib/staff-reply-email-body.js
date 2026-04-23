/**
 * Build staff portal → client reply HTML using the same Resend shell + Julie signature
 * as transactional emails (lib/resend-email-template.js). Gmail sends the HTML.
 */

const {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
} = require("./resend-email-template");

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToBodyHtml(text) {
  const paras = String(text || "").split(/\n\s*\n+/);
  return paras
    .map((p) => {
      const chunk = escapeHtml(p).replace(/\n/g, "<br />\n");
      return `<p style="margin:0 0 16px;">${chunk}</p>`;
    })
    .join("\n");
}

/**
 * Remove common AI / human closings and Julie name–title blocks at the end so we do not
 * duplicate the branded signature from resend-email-template.
 */
function stripTrailingSignature(text) {
  let t = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n-{3,}\s*\n[\s\S]{0,600}$/m, "")
    .trimEnd();

  const paras = t.split(/\n\s*\n/);

  /** Keep "Warm regards,\\nJulie" style closings; do not strip as duplicate signature. */
  function isAllowedJulieSignOff(p) {
    const s = p.trim();
    if (!s || s.length > 160) return false;
    if (/\[|braunsroth|internal insurance assistant|licensed.*life|mejor\s+vida\s+insurance/i.test(s)) {
      return false;
    }
    const lines = s.split(/\n/).map((x) => x.trim()).filter(Boolean);
    if (lines.length !== 2) return false;
    const closings =
      /^(warm regards|kind regards|best regards|sincerely|atentamente|un saludo|saludos cordiales)/i;
    if (!closings.test(lines[0])) return false;
    if (!/^julie\.?$/i.test(lines[1])) return false;
    return true;
  }

  const isSigPara = (p) => {
    const s = p.trim();
    if (!s || s.length > 900) return false;
    if (isAllowedJulieSignOff(p)) return false;
    const low = s.toLowerCase();
    const hasAiPlaceholder =
      /\[your name\]|\[your contact information\]|internal insurance assistant/i.test(low);
    if (hasAiPlaceholder && s.length < 600) return true;
    const hasJulieName = /\bjulie\b/.test(low) && /\bbraunsroth\b/.test(low);
    const hasClosing =
      /(best regards|kind regards|warm regards|sincerely|yours truly|thank you|thanks,|thanks!|warmly|cheers|un saludo|atentamente|cordialmente|saludos cordiales)/i.test(
        s
      );
    const hasTitle =
      /licensed.*(life|health)/i.test(s) ||
      /agente licenciada/i.test(s) ||
      /insurance agent/i.test(s);
    const hasMvi = /mejor\s+vida\s+insurance/i.test(s);
    const lines = s.split(/\n/).filter((x) => x.trim());
    if (lines.length === 0) return false;
    if (lines.length <= 8 && hasJulieName && (hasTitle || hasMvi || hasClosing)) return true;
    if (lines.length <= 6 && (hasClosing && (hasTitle || hasMvi || hasJulieName))) return true;
    if (lines.length <= 3 && hasJulieName) return true;
    // Keep a lone "Julie" line (draft sign-off); only strip full-name / title blocks.
    if (lines.length === 1 && /^julie\s+braunsroth/i.test(s.trim())) return true;
    return false;
  };

  const out = [...paras];
  while (out.length > 1 && isSigPara(out[out.length - 1])) {
    out.pop();
  }
  if (out.length === 1 && isSigPara(out[0])) {
    return t;
  }
  return out.join("\n\n").trim();
}

function isSpanishLanguage(language) {
  const s = String(language || "").trim();
  if (!s) return false;
  if (/^es$/i.test(s)) return true;
  return /spanish|español|espanol/i.test(s);
}

function buildStaffClientReplyHtml(replyDraft, language) {
  const cleaned = stripTrailingSignature(replyDraft);
  const useEs = isSpanishLanguage(language);
  const inner =
    plainTextToBodyHtml(cleaned) + (useEs ? signatureBlockES() : signatureBlockEN());
  return {
    html: wrapResendEmailHtml(inner, useEs ? LOGO_ES : LOGO_EN),
    plainBody: cleaned,
  };
}

module.exports = {
  buildStaffClientReplyHtml,
  stripTrailingSignature,
  plainTextToBodyHtml,
  isSpanishLanguage,
};
