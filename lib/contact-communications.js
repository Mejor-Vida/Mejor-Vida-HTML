/**
 * Log inbound/outbound client messages for staff CRM communication history.
 */

function oneLineSummary(text, fallback) {
  const fb = fallback || "Message";
  const t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return fb;
  if (t.length <= 140) return t;
  return t.slice(0, 137).trim() + "…";
}

function htmlToPlain(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sbHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

/**
 * Insert a communication row. Failures are logged and never throw to callers.
 * @returns {Promise<string|null>} inserted id when available
 */
async function logContactCommunication(supabaseUrl, serviceKey, row) {
  if (!supabaseUrl || !serviceKey || !row || !row.contactId) return null;

  const summarySource = row.summary || row.subject || row.body;
  const payload = {
    contact_id: row.contactId,
    direction: row.direction === "inbound" ? "inbound" : "outbound",
    channel: row.channel || "system",
    summary: oneLineSummary(summarySource, row.fallbackSummary || "Message"),
    body: row.body != null ? String(row.body).slice(0, 50000) : null,
    subject: row.subject != null ? String(row.subject).slice(0, 500) : null,
    meta: row.meta && typeof row.meta === "object" ? row.meta : {},
  };

  try {
    const base = String(supabaseUrl).replace(/\/$/, "");
    const res = await fetch(`${base}/rest/v1/contact_communications`, {
      method: "POST",
      headers: sbHeaders(serviceKey),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text();
      console.warn(
        "[contact-communications] insert failed:",
        res.status,
        t.slice(0, 300)
      );
      return null;
    }
    return null;
  } catch (e) {
    console.warn("[contact-communications] insert error:", (e && e.message) || e);
    return null;
  }
}

module.exports = {
  oneLineSummary,
  htmlToPlain,
  logContactCommunication,
};
