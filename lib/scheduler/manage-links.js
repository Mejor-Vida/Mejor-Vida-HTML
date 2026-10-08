function siteOrigin() {
  const raw = String(process.env.SITE_URL || process.env.VERCEL_URL || "").trim();
  if (raw) {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    return withProto.replace(/\/$/, "");
  }
  return "https://www.mejorvidainsurance.com";
}

function buildManageUrls({ appointmentId, cancelToken, language }) {
  const id = String(appointmentId || "").trim();
  const token = String(cancelToken || "").trim();
  if (!id || !token) return { manageUrl: "", rescheduleUrl: "", cancelUrl: "" };
  const isEn = String(language || "").toLowerCase().startsWith("en");
  const path = isEn ? "/en/schedule-manage.html" : "/schedule-manage.html";
  const q = `id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  const manageUrl = `${siteOrigin()}${path}?${q}`;
  const bookPath = isEn ? "/en/schedule-julie.html" : "/schedule-julie.html";
  return {
    manageUrl,
    rescheduleUrl: `${siteOrigin()}${bookPath}`,
    cancelUrl: `${manageUrl}#cancel`,
  };
}

module.exports = { siteOrigin, buildManageUrls };
