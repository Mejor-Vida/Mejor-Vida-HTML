/**
 * /api/nurture-enroll-cron.js
 * Vercel Cron Job — runs every 10 minutes.
 *
 * Enrolls contacts whose pipeline stage is before call_scheduled (new_contact, engaged, or quoted).
 * After a 30-minute quiet period, enrolls those not yet in nurture_sequence. The nurture sequence
 * aims to get leads to schedule a call. This avoids double-enrollment when contact-capture and
 * lead-intake fire close together.
 *
 * vercel.json: { "path": "/api/nurture-enroll-cron", "schedule": "5,15,25,35,45,55 * * * *" }
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET
 */

function sbHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Missing Supabase env" });
  }

  const base = `${supabaseUrl}/rest/v1`;
  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

  console.log(`[nurture-enroll-cron] Running at ${now.toISOString()}`);

  try {
    // 1) lead_state rows eligible for nurture (pre–call_scheduled stages)
    const lsRes = await fetch(
      `${base}/lead_state?select=contact_id,pipeline_stage&pipeline_stage=in.(new_contact,engaged,quoted)&limit=200`,
      { headers: sbHeaders(supabaseKey) },
    );
    const lsText = await lsRes.text();
    if (!lsRes.ok) throw new Error(`lead_state fetch: ${lsRes.status} ${lsText.slice(0, 300)}`);
    const leadRows = JSON.parse(lsText);
    const contactIds = [...new Set((leadRows || []).map((r) => r.contact_id).filter(Boolean))];
    if (contactIds.length === 0) {
      console.log("[nurture-enroll-cron] No eligible lead_state rows");
      return res.status(200).json({ ran_at: now.toISOString(), enrolled: 0 });
    }

    // 2) Contacts old enough (created_at <= now - 30m)
    let oldContacts = [];
    for (const ids of chunk(contactIds, 40)) {
      const inList = ids.join(",");
      const cRes = await fetch(
        `${base}/contacts?id=in.(${inList})&created_at=lte.${encodeURIComponent(thirtyMinAgo)}&select=id,phone,whatsapp_id,created_at`,
        { headers: sbHeaders(supabaseKey) },
      );
      const cText = await cRes.text();
      if (!cRes.ok) throw new Error(`contacts fetch: ${cRes.status} ${cText.slice(0, 300)}`);
      oldContacts = oldContacts.concat(JSON.parse(cText));
    }

    if (oldContacts.length === 0) {
      console.log("[nurture-enroll-cron] No candidates past 30-minute window");
      return res.status(200).json({ ran_at: now.toISOString(), enrolled: 0 });
    }

    const candidateIds = oldContacts.map((c) => c.id);

    // 3) Exclude already enrolled
    const nurtureRes = await fetch(`${base}/nurture_sequence?select=contact_id&contact_id=in.(${candidateIds.join(",")})`, {
      headers: sbHeaders(supabaseKey),
    });
    const nurtureText = await nurtureRes.text();
    if (!nurtureRes.ok) throw new Error(`nurture check: ${nurtureRes.status} ${nurtureText.slice(0, 300)}`);
    const alreadyEnrolled = new Set((JSON.parse(nurtureText) || []).map((r) => r.contact_id));

    const toEnroll = oldContacts.filter((c) => !alreadyEnrolled.has(c.id));
    if (toEnroll.length === 0) {
      console.log("[nurture-enroll-cron] All candidates already enrolled");
      return res.status(200).json({ ran_at: now.toISOString(), enrolled: 0 });
    }

    const rows = toEnroll.map((c) => ({
      contact_id: c.id,
      manychat_subscriber_id: c.whatsapp_id || null,
      status: "active",
      phase: 1,
      step: 1,
      enrolled_at: now.toISOString(),
      next_send_at: now.toISOString(),
    }));

    const insertRes = await fetch(`${base}/nurture_sequence`, {
      method: "POST",
      headers: { ...sbHeaders(supabaseKey), Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    });
    if (!insertRes.ok) {
      const t = await insertRes.text();
      throw new Error(`nurture insert: ${insertRes.status} ${t.slice(0, 300)}`);
    }

    console.log(`[nurture-enroll-cron] Enrolled ${toEnroll.length} contacts`);
    return res.status(200).json({
      ran_at: now.toISOString(),
      enrolled: toEnroll.length,
      contact_ids: toEnroll.map((c) => c.id),
    });
  } catch (err) {
    console.error("[nurture-enroll-cron] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
