const { requireStaffAuth, json, readJsonBody } = require("./_inbox-lib");

function isSpanishLanguage(lang) {
  const s = String(lang || "").trim();
  if (/^es$/i.test(s)) return true;
  return /spanish|español|espanol/i.test(s);
}

function buildPrompt(body, useEs) {
  const leadFn = String((body && body.leadFirstName) || "").trim();
  const leadLn = String((body && body.leadLastName) || "").trim();
  const leadName = [leadFn, leadLn].filter(Boolean).join(" ").trim() || (useEs ? "el consumidor" : "the consumer");
  const leadEmail = String((body && body.leadEmail) || "").trim() || (useEs ? "no proporcionado" : "not provided");
  const leadPhone = String((body && body.leadPhone) || "").trim() || (useEs ? "no proporcionado" : "not provided");
  const leadState = String((body && body.leadState) || "").trim().toUpperCase() || "unknown";
  const agentName = String((body && body.agentDisplayName) || "").trim() || (useEs ? "estimado/a" : "there");
  const agentCo = String((body && body.agentCompany) || "").trim();
  const ctx =
    String((body && body.referralContext) || "").trim() ||
    (useEs ? "(Sin contexto adicional — mantén la presentación general.)" : "(No extra context — keep the intro general.)");
  const coLine = agentCo
    ? useEs
      ? `Trabaja con ${agentCo}.`
      : `They are with ${agentCo}.`
    : "";

  if (useEs) {
    return (
      `Eres Julie de Mejor Vida Insurance. Redacta el **cuerpo** de un correo (texto plano) **para** un agente de seguros licenciado (${agentName}) en ${leadState}. ${coLine}\n` +
      `Presentas a un consumidor que necesita ayuda en ese estado y lo conectas para que el agente pueda dar seguimiento directamente.\n\n` +
      `Consumidor: ${leadName}\n` +
      `Estado: ${leadState}\n` +
      `Correo: ${leadEmail}\n` +
      `Teléfono: ${leadPhone}\n\n` +
      `Lo que necesita (resumen del equipo):\n${ctx}\n\n` +
      `Requisitos:\n` +
      `- Profesional, cordial y conciso; 130–220 palabras; sin emojis.\n` +
      `- No inventes precios, nombres de aseguradoras ni garantías de cobertura.\n` +
      `- Pide al agente que contacte al consumidor al correo/teléfono indicados.\n` +
      `- Termina con **exactamente dos líneas** y nada después: (1) "Atentamente," o "Un saludo cordial,"; (2) "Julie" (solo el nombre). Sin cargos ni marcadores.\n`
    );
  }

  return (
    `You are Julie from Mejor Vida Insurance. Write the **body** of an email (plain text) **to** a licensed insurance agent (${agentName}) in ${leadState}. ${coLine}\n` +
    `You are introducing a consumer who needs help in that state and connecting them so the agent can follow up directly.\n\n` +
    `Consumer: ${leadName}\n` +
    `State: ${leadState}\n` +
    `Email: ${leadEmail}\n` +
    `Phone: ${leadPhone}\n\n` +
    `What they need (staff summary):\n${ctx}\n\n` +
    `Requirements:\n` +
    `- Professional, warm, concise; 130–220 words; no emojis.\n` +
    `- Do not invent prices, carrier names, or coverage guarantees.\n` +
    `- Ask the agent to reach out to the consumer at the email/phone above.\n` +
    `- End with **exactly two lines** and nothing after: (1) "Warm regards," (2) "Julie" (first name only). No job titles or placeholders.\n`
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return json(res, 500, { error: "Server missing required configuration" });

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const referralContext = String((body && body.referralContext) || "").trim();
  const agentDisplayName = String((body && body.agentDisplayName) || "").trim();
  const useEs = isSpanishLanguage(body && body.language);
  if (!referralContext || referralContext.length < 8) {
    return json(res, 400, { error: "referralContext required (what the lead needs)" });
  }
  if (!agentDisplayName) {
    return json(res, 400, { error: "agentDisplayName required — select or match an OOS agent" });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.35,
        max_tokens: 500,
        messages: [{ role: "user", content: buildPrompt(body, useEs) }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "OpenAI error";
      return json(res, 500, { error: String(msg).slice(0, 200) });
    }
    const text =
      (data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content) ||
      "";
    return json(res, 200, { email: String(text).trim(), language: useEs ? "Spanish" : "English" });
  } catch (e) {
    return json(res, 500, { error: "Failed to generate email" });
  }
};
