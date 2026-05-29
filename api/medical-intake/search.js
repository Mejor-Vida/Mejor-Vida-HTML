const { json, requireValidIntakeToken } = require("./_lib");
const {
  searchDrugs,
  searchDrugDosages,
  searchProviders,
  searchPharmacies,
  searchConditions,
} = require("../../lib/medical-lookup-sync");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }
  try {
    const gate = await requireValidIntakeToken(req);
    if (!gate.ok) return json(res, gate.status, { ok: false, error: gate.error });
    const type = String((req.query && req.query.type) || "").toLowerCase();
    const q = req.query || {};

    if (type === "drugs") {
      const items = await searchDrugs(q.q || "");
      return json(res, 200, { ok: true, items });
    }
    if (type === "drug-dosages") {
      const items = await searchDrugDosages(q.rxcui || "", q.name || "");
      return json(res, 200, { ok: true, items });
    }
    if (type === "providers") {
      const result = await searchProviders({
        searchTerm: q.searchTerm || q.q || "",
        zipCode: q.zipCode || q.zip || "",
        radius: parseInt(q.radius || "25", 10),
        page: parseInt(q.page || "1", 10),
        perPage: parseInt(q.perPage || "20", 10),
      });
      if (result.error) return json(res, 400, { ok: false, error: result.error, items: [] });
      return json(res, 200, { ok: true, items: result.items });
    }
    if (type === "pharmacies") {
      const result = await searchPharmacies({
        pharmacyName: q.pharmacyName || q.q || "",
        zipCode: q.zipCode || q.zip || "",
        radius: parseInt(q.radius || "25", 10),
        pharmacyType: q.pharmacyType || "physical",
      });
      if (result.error) return json(res, 400, { ok: false, error: result.error, items: [] });
      return json(res, 200, { ok: true, items: result.items });
    }
    if (type === "conditions") {
      const items = await searchConditions(q.q || "");
      return json(res, 200, { ok: true, items, count: items.length });
    }
    return json(res, 400, { ok: false, error: "type required (drugs|drug-dosages|providers|pharmacies|conditions)" });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "search_failed") });
  }
};
