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
  const isEn = String(language || "").toLowerCase().startsWith("en");
  const bookPath = isEn ? "/en/schedule-julie.html" : "/schedule-julie.html";
  if (!id) return { manageUrl: "", rescheduleUrl: "", cancelUrl: "" };
  if (!token) {
    return {
      manageUrl: "",
      rescheduleUrl: `${siteOrigin()}${bookPath}`,
      cancelUrl: "",
    };
  }
  const path = isEn ? "/en/schedule-manage.html" : "/schedule-manage.html";
  const q = `id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  const manageUrl = `${siteOrigin()}${path}?${q}`;
  return {
    manageUrl,
    rescheduleUrl: `${siteOrigin()}${bookPath}`,
    cancelUrl: `${manageUrl}#cancel`,
  };
}

module.exports = { siteOrigin, buildManageUrls };
