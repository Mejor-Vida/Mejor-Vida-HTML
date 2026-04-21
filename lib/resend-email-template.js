/**
 * Canonical HTML shell for Mejor Vida emails sent via Resend (api/post-quote-email.js, nurture, etc.).
 *
 * Use wrapResendEmailHtml(bodyHtml, logoUrl) for any transactional email: pass only the inner
 * body (paragraphs, CTAs). Append signatureBlockEN() or signatureBlockES() inside bodyHtml when needed.
 *
 * Logo URLs point at production CDN paths; local previews swap to ../img/*-email.png in scripts.
 */

const LOGO_EN = "https://www.mejorvidainsurance.com/img/logo-english2-email.png";
const LOGO_ES = "https://www.mejorvidainsurance.com/img/logo-spanish2-email.png";

const LOGO_MAX_WIDTH_PX = 440;

function signatureBlockEN() {
  return `<div style="border-top:1px solid #e0e0e0;margin-top:28px;padding-top:20px;font-size:14px;color:#555;line-height:1.6;">
  <strong style="font-size:15px;color:#1e3a8a;">Julie Braunsroth</strong><br>
  Licensed Life &amp; Health Insurance Agent | Nebraska<br>
  <strong>Mejor Vida Insurance LLC</strong><br>
  Life Insurance | Final Expense | Family Protection<br>
  📞 <a href="tel:+14024405438" style="color:#3b82f6;text-decoration:none;">Call Julie: 402-440-5438</a> | 💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;text-decoration:none;">WhatsApp: 402-440-5438</a><br>
  🌐 <a href="https://www.mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">mejorvidainsurance.com</a><br>
  ✉️ <a href="mailto:julie@mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">julie@mejorvidainsurance.com</a><br>
  <span style="font-size:12px;color:#888;">Se habla español | We speak English</span>
</div>`;
}

function signatureBlockES() {
  return `<div style="border-top:1px solid #e0e0e0;margin-top:28px;padding-top:20px;font-size:14px;color:#555;line-height:1.6;">
  <strong style="font-size:15px;color:#1e3a8a;">Julie Braunsroth</strong><br>
  Agente Licenciada en Seguros de Vida y Salud | Nebraska<br>
  <strong>Mejor Vida Insurance LLC</strong><br>
  Seguros de Vida | Gastos Finales | Protección Familiar<br>
  📞 <a href="tel:+14024405438" style="color:#3b82f6;text-decoration:none;">Llama a Julie: 402-440-5438</a> | 💬 <a href="https://wa.me/14024405438" style="color:#3b82f6;text-decoration:none;">WhatsApp: 402-440-5438</a><br>
  🌐 <a href="https://www.mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">mejorvidainsurance.com</a><br>
  ✉️ <a href="mailto:julie@mejorvidainsurance.com" style="color:#3b82f6;text-decoration:none;">julie@mejorvidainsurance.com</a><br>
  <span style="font-size:12px;color:#888;">Se habla español | We speak English</span>
</div>`;
}

/**
 * Full HTML document: logo row, thin blue bar, spacer, body column, footer.
 * @param {string} bodyHtml — Inner HTML only (no html/head/body).
 * @param {string} logoUrl — LOGO_EN or LOGO_ES (absolute URL for Resend).
 */
function wrapResendEmailHtml(bodyHtml, logoUrl) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;text-align:left !important;}
.c{max-width:600px;margin:8px auto 32px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);text-align:left !important;}
.hdr-logo-cell{text-align:left !important;}
.hdr-logo-cell img{display:block !important;margin:0 !important;margin-left:0 !important;margin-right:auto !important;border:0 !important;}
.b{padding:32px;color:#333;font-size:16px;line-height:1.7;}
.b p{margin:0 0 16px;}.cta{text-align:center;padding:8px 0 24px;}
.quote-box{background:#e8f5e9;border:2px solid #43a047;border-radius:10px;padding:20px;text-align:center;margin:20px 0;}
.quote-box .range{font-size:32px;font-weight:bold;color:#2e7d32;}
.quote-box .label{font-size:13px;color:#666;margin-top:4px;}
.appt-box{background:#e3f2fd;border:2px solid #1565c0;border-radius:10px;padding:16px 20px;margin:20px 0;}
.appt-box h3{color:#1565c0;font-size:15px;margin:0 0 6px;}
.check{color:#43a047;margin-right:6px;}
.f{background:#f4f6f8;padding:20px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;}
</style></head><body><div class="c" style="text-align:left !important;">
<table role="presentation" align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;text-align:left !important;">
<tr>
<td class="hdr-logo-cell" bgcolor="#ffffff" align="left" valign="top" style="padding:0 16px 0 16px;text-align:left !important;vertical-align:top;line-height:0;font-size:0;mso-line-height-rule:exactly;">
<a href="https://www.mejorvidainsurance.com" style="text-align:left !important;text-decoration:none;display:block;">
<img src="${logoUrl}" alt="Mejor Vida Insurance" align="left" width="${LOGO_MAX_WIDTH_PX}" border="0" style="width:${LOGO_MAX_WIDTH_PX}px;max-width:${LOGO_MAX_WIDTH_PX}px;height:auto;display:block;border:0;outline:none;margin-top:0;margin-bottom:0;margin-left:0;margin-right:auto;" />
</a>
</td>
</tr>
<tr>
<td bgcolor="#1e3a8a" style="padding:0;line-height:0;font-size:0;mso-line-height-rule:exactly;border-top:0;">
<div style="height:6px;line-height:6px;font-size:1px;">&nbsp;</div>
</td>
</tr>
<tr>
<td bgcolor="#ffffff" style="padding:0;line-height:0;font-size:0;mso-line-height-rule:exactly;">
<div style="height:44px;line-height:44px;font-size:1px;">&nbsp;</div>
</td>
</tr>
</table>
<div class="b" style="padding:32px;color:#333;font-size:16px;line-height:1.7;">${bodyHtml}</div>
<div class="f"><p>&copy; Mejor Vida Insurance | <a href="https://www.mejorvidainsurance.com" style="color:#888;">mejorvidainsurance.com</a></p>
<p><a href="https://www.mejorvidainsurance.com/unsubscribe" style="color:#888;">Unsubscribe</a></p></div>
</div></body></html>`;
}

module.exports = {
  wrapResendEmailHtml,
  signatureBlockEN,
  signatureBlockES,
  LOGO_EN,
  LOGO_ES,
  LOGO_MAX_WIDTH_PX,
};
