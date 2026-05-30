const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig } = require("./_inbox-lib");
const { canAccessPhi } = require("../../lib/staff-permissions");
const {
  searchDrugs,
  searchDrugDosages,
  searchProviders,
  searchPharmacies,
  searchConditions,
} = require("../../lib/medical-lookup-sync");

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  try {
    const type = String((req.query && req.query.type) || "").toLowerCase();
    const q = req.query || {};

    if (type === "drugs") {
      const result = await searchDrugs(q.q || "");
      return json(res, 200, {
        ok: true,
        items: result.items,
        result_count: result.result_count,
        total: result.result_count,
      });
    }
    if (type === "drug-dosages") {
      const items = await searchDrugDosages(q.rxcui || "", q.name || "");
      return json(res, 200, { ok: true, items });
    }
    if (type === "providers") {
      const result = await searchProviders({
        searchTerm: q.searchTerm || q.q || "",
        zipCode: q.zipCode || q.zip || "",
        radius: parseInt(q.radius || q.distance || "25", 10),
        page: parseInt(q.page || "1", 10),
        perPage: parseInt(q.perPage || "20", 10),
      });
      if (result.error) return json(res, 400, { ok: false, error: result.error, items: [], total: 0 });
      return json(res, 200, {
        ok: true,
        items: result.items,
        total: result.total,
        result_count: result.result_count,
        page: result.page,
        perPage: result.perPage,
      });
    }
    if (type === "pharmacies") {
      const result = await searchPharmacies({
        pharmacyName: q.pharmacyName || q.q || "",
        zipCode: q.zipCode || q.zip || "",
        address: q.address || "",
        radius: parseInt(q.radius || q.distance || "25", 10),
        pharmacyType: q.pharmacyType || "physical",
        page: parseInt(q.page || "1", 10),
        perPage: parseInt(q.perPage || "10", 10),
      });
      if (result.error) {
        return json(res, 400, {
          ok: false,
          error: result.error,
          items: [],
          total: 0,
          result_count: 0,
        });
      }
      return json(res, 200, {
        ok: true,
        items: result.items,
        total: result.total,
        result_count: result.result_count,
        page: result.page,
        perPage: result.perPage,
      });
    }
    if (type === "conditions") {
      const result = await searchConditions(q.q || "");
      return json(res, 200, {
        ok: true,
        items: result.items,
        result_count: result.result_count,
        total: result.result_count,
        count: result.result_count,
      });
    }
    return json(res, 400, {
      ok: false,
      error: "type required (drugs|drug-dosages|providers|pharmacies|conditions)",
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || "search_failed") });
  }
};
